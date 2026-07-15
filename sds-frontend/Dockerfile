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

# Configuración Nginx (proxy al backend + transmisión en vivo protegida)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
