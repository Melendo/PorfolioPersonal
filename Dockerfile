# --- Etapa 1: Construcción (Build) ---
FROM node:20-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor para organizar los archivos
WORKDIR /app


COPY package*.json ./
RUN npm ci || npm install

# Copiamos todo el código fuente del portfolio (incluyendo la carpeta 'data' con los archivos JSON)
COPY . .

# Compilamos la aplicación web estática, lo que generará el contenido en la carpeta 'dist/'
RUN npm run build

# --- Etapa 2: Servidor de Producción (Nginx) ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
