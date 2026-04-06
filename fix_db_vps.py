import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("187.77.62.115", username="root", password="Agustinyas43#PazCamion")
    
    # 1. Ejecutar Schema.sql
    print("⏳ Instalando tablas base de datos (schema.sql)...")
    cmd_schema = "cat /var/www/select-dance-studio/database/schema.sql | docker exec -i sds-db mysql -u root -pSelect2025!Root select_dance_db"
    _, stdout, stderr = client.exec_command(cmd_schema)
    err = stderr.read().decode()
    if err and "Warning" not in err:
        print("Schema Err:", err)
        
    print("⏳ Ejecutando init_bot_tables.sql...")
    cmd_schema2 = "cat /var/www/select-dance-studio/database/init_bot_tables.sql | docker exec -i sds-db mysql -u root -pSelect2025!Root select_dance_db"
    client.exec_command(cmd_schema2)
    
    # 2. Insertar Administrador
    print("⏳ Creando Administrador Maestro...")
    hash_pass = "$2b$10$HEDqokVXbI8P7bEfH9hD5.22/uPWmu1mRhgANK1HZHMdRORviP6Ht6"
    
    query = f"INSERT INTO usuarios (email, password_hash, rol, activo, primer_login, nombre, apellido) VALUES ('admin@selectdancestudio.com', '{hash_pass}', 'admin', 1, 0, 'Admin', 'Global') ON DUPLICATE KEY UPDATE activo = 1;"
    cmd_user = f'docker exec sds-db mysql -u root -pSelect2025!Root select_dance_db -D select_dance_db -e "{query}"'
    client.exec_command(cmd_user)
    
    # 3. Verificar
    print("✅ Operación terminada. Usuarios detectados:")
    cmd_verify = 'docker exec sds-db mysql -u root -pSelect2025!Root select_dance_db -D select_dance_db -e "SELECT id, email, rol FROM usuarios;"'
    _, stdout, stderr = client.exec_command(cmd_verify)
    print(stdout.read().decode())

finally:
    client.close()
