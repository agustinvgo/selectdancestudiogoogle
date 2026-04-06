# Etapa 1: Compilación (Build)
FROM node:20-slim AS build-stage

WORKDIR /app

# Argumentos de construcción para inyectar variables en el build de Vite
ARG VITE_API_URL
ARG VITE_URL_BASE
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_URL_BASE=$VITE_URL_BASE

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias completas para compilar con Vite
RUN npm install

# Copiar el resto del código del frontend
COPY . .

# Generar el build de producción
RUN npm run build

# Etapa 2: Servidor de Producción (Nginx)
FROM nginx:alpine

# Copiar los archivos estáticos desde la etapa de compilación
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Configuración Nginx con proxy inverso para el backend
RUN printf "server { \n\
    listen 80; \n\
    server_name www.selectdancestudio.com; \n\
    return 301 https://selectdancestudio.com\$request_uri; \n\
} \n\
 \n\
server { \n\
    listen 80 default_server; \n\
    server_name selectdancestudio.com localhost _; \n\
    client_max_body_size 10M; \n\
 \n\
    # Habilitar compresión GZIP \n\
    gzip on; \n\
    gzip_vary on; \n\
    gzip_min_length 10240; \n\
    gzip_proxied any; \n\
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/json application/xml; \n\
    gzip_disable \"MSIE [1-6]\.\"; \n\
 \n\
    # Frontend React (SPA) \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html index.htm; \n\
        try_files \$uri \$uri/ /index.html; \n\
    } \n\
 \n\
    # Proxy API → Backend Node.js \n\
    location /api { \n\
        proxy_pass http://backend:5000; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Upgrade \$http_upgrade; \n\
        proxy_set_header Connection 'upgrade'; \n\
        proxy_set_header Host \$host; \n\
        proxy_set_header X-Real-IP \$remote_addr; \n\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; \n\
        proxy_set_header X-Forwarded-Proto \$scheme; \n\
        proxy_cache_bypass \$http_upgrade; \n\
        proxy_read_timeout 300s; \n\
    } \n\
 \n\
    # Proxy archivos subidos (comprobantes, etc.) \n\
    location /uploads { \n\
        proxy_pass http://backend:5000; \n\
        proxy_set_header Host \$host; \n\
        proxy_set_header X-Real-IP \$remote_addr; \n\
    } \n\
 \n\
    # Proxy assets publicos (imagenes de cursos, logo) \n\
    location /assets/public { \n\
        proxy_pass http://backend:5000; \n\
        proxy_set_header Host \$host; \n\
        expires 30d; \n\
        add_header Cache-Control \"public, immutable\"; \n\
    } \n\
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
