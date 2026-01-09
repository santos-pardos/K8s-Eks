# Etapa 1: 'Builder' - Prepara los archivos estáticos.
FROM alpine:3.18 AS builder
# Define el directorio de trabajo para esta etapa.
WORKDIR /app
# Copia los archivos del frontend.
COPY ./frontend/ /app/

# Etapa 2: 'Final' - Sirve los estáticos con Nginx.
FROM nginx:1.25-alpine

# Copia los estáticos desde la etapa 'builder'.
COPY --from=builder /app /usr/share/nginx/html
# Aplica la configuración personalizada de Nginx.
COPY ./proxy/nginx.conf /etc/nginx/conf.d/default.conf
