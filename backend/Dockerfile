# Etapa 1: Construcción/Dependencias
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Etapa 2: Ejecución (Imagen final ligera)
FROM node:20-alpine
WORKDIR /app

# Crear usuario no-root por seguridad (Buenas prácticas DevOps)
USER node

# Copiar solo lo necesario desde la etapa de construcción
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "start"]