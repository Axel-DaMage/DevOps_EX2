# Etapa 1: Construcción (Multi-stage build)
FROM node:20-alpine AS build
WORKDIR /app

# Argumentos de construcción para inyectar variables de entorno
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor de Producción (Imagen final)
FROM nginx:alpine

# Limpieza de archivos por defecto de Nginx y copia de la build
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]