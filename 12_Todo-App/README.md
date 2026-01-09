# todo-app-docker-compose
Actividad 2 - Contenedores

# DockerIgnore  .dockerignore
```
# Excluye archivos innecesarios del contexto de build de Docker.
node_modules
.git
.gitignore
*.md

# Excluye el archivo de variables de entorno
.env
```


# Enviroments  .env
```
# Credenciales de PostgreSQL
# Estas variables son leídas por el contenedor 'db' y 'backend'.
POSTGRES_DB=todo_db
POSTGRES_USER=todouser
POSTGRES_PASSWORD=todopassword

# Configuración del Backend
# El backend usa estas variables para conectarse a la BD.
DB_HOST=todo-db
DB_PORT=5432
DB_NAME=$POSTGRES_DB
DB_USER=$POSTGRES_USER
DB_PASSWORD=$POSTGRES_PASSWORD
```
