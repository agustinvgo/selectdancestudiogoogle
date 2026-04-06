#!/bin/bash
# =============================================================
# Script de Deploy - Select Dance Studio
# VPS Hostinger | Docker Compose
# =============================================================

set -e  # Salir si cualquier comando falla

APP_DIR="/var/www/select-dance-studio"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"

echo ""
echo "======================================================="
echo "  🚀 Deploy - Select Dance Studio"
echo "======================================================="

# ── 1. Verificar Docker ────────────────────────────────────
if ! command -v docker &> /dev/null; then
    echo "📦 Docker no encontrado. Instalando..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker instalado."
else
    echo "✅ Docker ya está instalado: $(docker --version)"
fi

# ── 2. Verificar Docker Compose ────────────────────────────
if ! docker compose version &> /dev/null; then
    echo "📦 Instalando Docker Compose plugin..."
    apt-get update -qq
    apt-get install -y docker-compose-plugin
fi
echo "✅ Docker Compose: $(docker compose version)"

# ── 3. Crear carpeta de la app ─────────────────────────────
mkdir -p $APP_DIR
cd $APP_DIR

# ── 4. Detener contenedores viejos (si existen) ───────────
echo ""
echo "🛑 Deteniendo contenedores anteriores (si existen)..."
docker compose down --remove-orphans 2>/dev/null || true

# ── 5. Limpiar imágenes viejas del proyecto ────────────────
echo "🧹 Limpiando imágenes Docker antiguas del proyecto..."
docker image prune -f 2>/dev/null || true

# ── 6. Crear carpetas de persistencia ─────────────────────
echo "📁 Creando carpetas de datos persistentes..."
mkdir -p $APP_DIR/sds-backend/uploads
mkdir -p $APP_DIR/sds-backend/logs
mkdir -p $APP_DIR/database

# ── 7. Build y levantamiento ───────────────────────────────
echo ""
echo "🔨 Construyendo imágenes y levantando contenedores..."
echo "   (Esto puede tardar 3-5 minutos la primera vez)"
docker compose up --build -d

# ── 8. Esperar a que los contenedores estén listos ─────────
echo ""
echo "⏳ Esperando que los servicios inicien (30s)..."
sleep 30

# ── 9. Verificar estado ────────────────────────────────────
echo ""
echo "📊 Estado de los contenedores:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ── 10. Health check ───────────────────────────────────────
echo ""
echo "🩺 Verificando health del backend..."
MAX_RETRIES=10
RETRY=0
until curl -sf http://localhost:5000/api/health > /dev/null 2>&1; do
    RETRY=$((RETRY+1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        echo "❌ Backend no responde después de $MAX_RETRIES intentos."
        echo "   Revisá los logs con: docker compose logs backend"
        break
    fi
    echo "   Intento $RETRY/$MAX_RETRIES — esperando..."
    sleep 5
done

if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend OK"
fi

# ── 11. Resumen final ──────────────────────────────────────
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "187.77.62.115")
echo ""
echo "======================================================="
echo "  ✅ Deploy completado!"
echo "======================================================="
echo ""
echo "  🌐 Frontend:  http://$VPS_IP"
echo "  🔌 API:       http://$VPS_IP:5000/api/health"
echo "  🗄️  DB:        puerto 3306 (solo acceso interno Docker)"
echo ""
echo "  📋 Comandos útiles:"
echo "    Ver logs:       docker compose logs -f"
echo "    Ver logs backend: docker compose logs -f backend"
echo "    Reiniciar:      docker compose restart"
echo "    Detener todo:   docker compose down"
echo "======================================================="
