import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("187.77.62.115", username="root", password="Agustinyas43PazCamio@")
    
    hash_pass = "$2b$10$HEDqokVXbI8P7bEfH9hD5.22/uPWmu1mRhgANK1HZHMdRORviP6Ht6"
    
    # Usando docker exec sin comandos interactivos (-i o -t)
    query = f"INSERT INTO usuarios (email, password_hash, rol, activo, primer_login) VALUES ('admin@selectdancestudio.com', '{hash_pass}', 'admin', 1, 0) ON DUPLICATE KEY UPDATE activo = 1;"
    cmd = f'docker exec sds-db mysql -u sds_user -pSelect2025!User select_dance_db -D select_dance_db -e "{query}"'
    
    print("Ejecutando insert...")
    _, stdout, stderr = client.exec_command(cmd)
    
    out = stdout.read().decode()
    err = stderr.read().decode()
    print("OUT:", out)
    print("ERR:", err)
    
    print("\nVerificando...")
    cmd_verify = 'docker exec sds-db mysql -u sds_user -pSelect2025!User select_dance_db -D select_dance_db -e "SELECT id, email, rol FROM usuarios;"'
    _, stdout, stderr = client.exec_command(cmd_verify)
    print("Usuarios actuales:")
    print(stdout.read().decode())
    print("Error if any:", stderr.read().decode())

finally:
    client.close()
