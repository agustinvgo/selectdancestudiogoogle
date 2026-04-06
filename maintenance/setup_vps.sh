#!/bin/bash

# Script de instalación de Docker y Docker Compose para Ubuntu 22.04
# Uso: sube este archivo a tu VPS y ejecútalo con 'bash setup_vps.sh'

# 1. Actualizar el sistema
echo "🔄 Actualizando paquetes del sistema..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar dependencias necesarias
echo "📦 Instalando dependencias básicas..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 3. Agregar la clave GPG oficial de Docker
echo "🔑 Agregando clave GPG de Docker..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Configurar el repositorio de Docker
echo "📂 Configurando repositorio de Docker..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Instalar Docker Engine y Docker Compose
echo "🐳 Instalando Docker Engine y Docker Compose..."
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. Activar Docker (hacerlo persistente)
echo "🚀 Activando Docker..."
sudo systemctl enable docker
sudo systemctl start docker

# 7. Crear enlace simbólico para compatibilidad con docker-compose clásico si es necesario
sudo ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

# 8. Verificar la instalación
echo "✅ Instalación completada con éxito."
docker --version
docker-compose --version
echo "--------------------------------------------------------"
echo "¡Tu VPS ya está listo para recibir el despliegue!"
echo "--------------------------------------------------------"
