#!/usr/bin/env python3
"""
Deploy Script - Select Dance Studio
Sube el proyecto al VPS de Hostinger y levanta Docker Compose
"""

import paramiko
import os
import sys
import tarfile
import time
import stat
from pathlib import Path

# ── Configuración ─────────────────────────────────────────
VPS_HOST = "187.77.62.115"
VPS_USER = "root"
VPS_PASS = "Agustinyas43#PazCamion"
REMOTE_PATH = "/var/www/select-dance-studio"

LOCAL_PROJECT = Path(__file__).parent

# Directorios y archivos a EXCLUIR del tar
EXCLUDE = {
    "node_modules", ".git", "dist", "build", "coverage",
    ".wwebjs_auth", ".wwebjs_cache", ".chrome",
    "backups", "deploy_package", "__pycache__",
    ".idea", ".vscode",
    "uploads",   # Persiste via Docker volume — no subir
    "logs",      # Persiste via Docker volume — no subir
    "migrations", "models", "tests",
    "deploy_package",
}

EXCLUDE_FILES = {
    "deploy.py", "*.log", "memory.dmp", "dump.rdb",
}

# ── Helpers ───────────────────────────────────────────────
def log(msg, icon="▶"):
    print(f"\n{icon}  {msg}")

def log_step(n, total, msg):
    print(f"\n[{n}/{total}] {msg}")

def should_exclude(path: str) -> bool:
    # Bloqueo agresivo si alguna de estas palabras gigantes aparece en toda la ruta
    forbidden = [
        "node_modules", ".git", "dist", "build", "coverage",
        ".wwebjs_", ".chrome", "backups", "deploy_package",
        "__pycache__", ".idea", ".vscode", "uploads", "logs", 
        "migrations", "models", "tests"
    ]
    p_lower = path.lower()
    for forb in forbidden:
        if forb in p_lower:
            return True
    return False


# ── Crear tar del proyecto ─────────────────────────────────
def create_tarball():
    tar_path = LOCAL_PROJECT / "sds_deploy.tar.gz"
    log_step(1, 5, f"Comprimiendo proyecto → {tar_path.name}")

    file_count = 0
    with tarfile.open(tar_path, "w:gz") as tar:
        for item in LOCAL_PROJECT.rglob("*"):
            rel = item.relative_to(LOCAL_PROJECT)
            rel_str = str(rel)

            # Excluir carpetas/archivos
            if should_exclude(rel_str):
                continue
            if item.name.startswith(".env") and item.name != ".env":
                continue
            if item.name == "sds_deploy.tar.gz":
                continue
            if item.name.endswith(".log"):
                continue

            tar.add(item, arcname=rel_str, recursive=False)
            file_count += 1

    size_mb = tar_path.stat().st_size / 1024 / 1024
    print(f"   ✅ {file_count} archivos | {size_mb:.1f} MB")
    return tar_path


# ── Conectar SSH ──────────────────────────────────────────
def connect_ssh():
    log_step(2, 5, f"Conectando a {VPS_USER}@{VPS_HOST}")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        hostname=VPS_HOST,
        username=VPS_USER,
        password=VPS_PASS,
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
    )
    print(f"   ✅ Conectado al VPS")
    return client


# ── Ejecutar comando SSH ──────────────────────────────────
def run_remote(client, cmd, show_output=True, timeout=300):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    stdin.close()

    output_lines = []
    error_lines = []

    # Leer stdout en tiempo real
    for line in stdout:
        line = line.rstrip()
        output_lines.append(line)
        if show_output:
            print(f"   {line}")

    # Leer stderr
    for line in stderr:
        line = line.rstrip()
        error_lines.append(line)
        if show_output and line:
            print(f"   ⚠  {line}")

    exit_code = stdout.channel.recv_exit_status()
    return exit_code, output_lines, error_lines


# ── Subir archivo por SCP ─────────────────────────────────
def upload_file(client, local_path: Path, remote_path: str):
    log_step(3, 5, f"Subiendo {local_path.name} al VPS")
    sftp = client.open_sftp()

    size_mb = local_path.stat().st_size / 1024 / 1024
    print(f"   📤 Tamaño: {size_mb:.1f} MB — puede tardar algunos segundos...")

    sftp.put(str(local_path), remote_path)
    sftp.close()
    print(f"   ✅ Archivo subido a {remote_path}")


# ── Preparar VPS y extraer ────────────────────────────────
def prepare_vps(client):
    log_step(4, 5, "Preparando VPS y extrayendo proyecto")

    commands = [
        # Instalar Docker si no está
        "which docker || (curl -fsSL https://get.docker.com | sh && systemctl enable docker && systemctl start docker)",
        # Instalar docker compose plugin si no está
        "docker compose version || apt-get install -y docker-compose-plugin 2>/dev/null || true",
        # Crear directorio
        f"mkdir -p {REMOTE_PATH}",
        # Detener contenedores anteriores
        f"cd {REMOTE_PATH} && docker compose down --remove-orphans 2>/dev/null || true",
        # Extraer el tar
        f"tar -xzf /tmp/sds_deploy.tar.gz -C {REMOTE_PATH}",
        # Limpiar tar
        "rm -f /tmp/sds_deploy.tar.gz",
        # Crear carpetas de persistencia
        f"mkdir -p {REMOTE_PATH}/sds-backend/uploads {REMOTE_PATH}/sds-backend/logs {REMOTE_PATH}/database",
        # Dar permisos al script de deploy
        f"chmod +x {REMOTE_PATH}/deploy-vps.sh",
    ]

    for cmd in commands:
        code, out, err = run_remote(client, cmd, show_output=False)
        if code != 0 and "already installed" not in " ".join(err):
            # Mostrar output si falló
            for line in out + err:
                if line: print(f"   {line}")


# ── Levantar Docker Compose ───────────────────────────────
def docker_up(client):
    log_step(5, 5, "Construyendo imágenes y levantando contenedores")
    print("   ⏳ Esto puede tardar 3-8 minutos la primera vez...")

    # Limpiar imágenes viejas
    run_remote(client, "docker image prune -f", show_output=False)

    # Levantar
    cmd = f"cd {REMOTE_PATH} && docker compose up --build -d 2>&1"
    stdin, stdout, stderr = client.exec_command(cmd, timeout=600)
    stdin.close()

    for line in stdout:
        line = line.rstrip()
        if line:
            print(f"   {line}")

    exit_code = stdout.channel.recv_exit_status()

    if exit_code != 0:
        print(f"\n   ❌ docker compose up falló con código {exit_code}")
        sys.exit(1)

    print("   ✅ Contenedores levantados")


# ── Health check ─────────────────────────────────────────
def health_check(client):
    print("\n   ⏳ Esperando que los servicios inicialicen (40s)...")
    time.sleep(40)

    print("   🩺 Verificando contenedores...")
    run_remote(client, 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"')

    print("\n   🩺 Verificando backend API...")
    code, _, _ = run_remote(
        client,
        "curl -sf http://localhost:5000/api/health",
        show_output=False
    )
    if code == 0:
        print("   ✅ Backend API responde correctamente")
    else:
        print("   ⚠  Backend aún no responde. Revisá con: docker compose logs backend")


# ── Main ─────────────────────────────────────────────────
def main():
    print("\n" + "=" * 55)
    print("  🚀 Deploy — Select Dance Studio")
    print("=" * 55)

    tar_path = None
    try:
        # 1. Crear tar
        tar_path = create_tarball()

        # 2. Conectar SSH
        client = connect_ssh()

        # 3. Subir tar
        upload_file(client, tar_path, "/tmp/sds_deploy.tar.gz")

        # 4. Preparar VPS
        prepare_vps(client)

        # 5. Docker up
        docker_up(client)

        # Health check
        health_check(client)

        client.close()

        print("\n" + "=" * 55)
        print("  ✅ Deploy completado exitosamente!")
        print("=" * 55)
        print(f"\n  🌐 Frontend:  http://{VPS_HOST}")
        print(f"  🔌 API:       http://{VPS_HOST}:5000/api/health")
        print(f"\n  📋 Para ver logs:")
        print(f"     ssh root@{VPS_HOST}")
        print(f"     cd {REMOTE_PATH}")
        print(f"     docker compose logs -f")
        print()

    except KeyboardInterrupt:
        print("\n\n⚠  Deploy cancelado por el usuario.")
        sys.exit(1)
    except paramiko.AuthenticationException:
        print(f"\n❌ Error: Credenciales SSH incorrectas.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        # Limpiar tar local
        if tar_path and tar_path.exists():
            tar_path.unlink()
            print(f"   🧹 Tar local eliminado.")


if __name__ == "__main__":
    main()
