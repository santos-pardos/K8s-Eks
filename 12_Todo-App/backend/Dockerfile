# Define la imagen base de Node.js (Alpine).
FROM node:18-alpine AS base

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia los archivos de definición de paquetes.
COPY package*.json ./

# Instala solo dependencias de producción.
RUN npm install --omit=dev

# Copia el resto del código fuente de la app.
COPY . .

# Expone el puerto interno de la aplicación.
EXPOSE 5000
# Define el comando de inicio del contenedor.
CMD ["npm", "start"]
