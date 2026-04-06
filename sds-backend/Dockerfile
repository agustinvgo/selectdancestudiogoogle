# Utilizar una imagen oficial de Node.js (versión 20 estable)
FROM node:20-slim

# Instalar dependencias necesarias para Puppeteer y Chrome en Linux
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias del proyecto (solo producción para imagen final)
# Usamos npm ci para mayor estabilidad en builds automatizados
RUN npm install --production

# Copiar el resto del código del backend
COPY . .

# Exponer el puerto configurado en variables de entorno (default 5000)
EXPOSE 5000

# Instalar PM2 de forma global para gestión de procesos y auto-reinicio
RUN npm install -g pm2

# Comando para arrancar la aplicación con PM2
CMD ["pm2-runtime", "src/index.js"]
