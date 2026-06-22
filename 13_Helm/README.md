¿Qué es Helm brevemente?

Imagina que Kubernetes es el sistema operativo de tu clúster. Helm es el gestor de paquetes de Kubernetes, es decir, el equivalente a apt en Ubuntu, yum en CentOS, npm para Node.js o pip para Python.

En lugar de crear y mantener decenas de archivos YAML estáticos (un archivo para el Deployment, otro para el Service, otro para el Ingress, etc.), Helm te permite agruparlos todos en un solo paquete reutilizable y configurable llamado Chart.

Sus 3 conceptos clave son:

    Chart: El paquete en sí. Contiene las plantillas (templates) de tus archivos YAML.

    Values (values.yaml): El archivo donde defines las variables (como la versión de la imagen, el número de réplicas o el puerto) que se inyectarán en las plantillas.

    Release: Una instancia de un Chart ejecutándose en tu clúster. Puedes instalar el mismo Chart varias veces con diferentes nombres y configuraciones (cada uno es un Release distinto).

Ejemplo Sencillo: Empaquetando un Nginx

Supongamos que quieres crear un paquete básico para desplegar servidores web Nginx.

Cuando creas un Chart (usando el comando helm create mi-sitio), Helm genera una estructura de carpetas. Nos centraremos en los dos archivos más importantes para un novato:
1. El archivo de variables (values.yaml)

Aquí defines los valores por defecto de tu aplicación. Es lo único que un usuario normal necesita tocar.
YAML
```
# values.yaml
replicaCount: 2
image:
  repository: nginx
  tag: "1.25.0"
```

2. La plantilla (templates/deployment.yaml)

Aquí es donde ocurre la magia. Es un archivo YAML de Kubernetes normal, pero con "huecos" (sintaxis de plantillas de Go) que Helm rellenará con lo que pusiste en el values.yaml.
YAML
```
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mi-servidor-web
spec:
  # Helm leerá el "2" del values.yaml
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        # Helm construirá: "nginx:1.25.0"
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: 80
```
Cómo se usa (Comandos básicos)

Una vez que tienes tu Chart listo, interactuar con tu clúster es mucho más limpio que usar kubectl apply -f para múltiples archivos.

1. Instalar la aplicación:
Esto toma tu Chart, inyecta los valores y lo manda a Kubernetes bajo el nombre "mi-primer-release".
Bash
```
helm install mi-primer-release ./mi-sitio
```
2. Actualizar la aplicación (Upgrade):
Si decides cambiar el values.yaml (por ejemplo, subir a 5 réplicas o cambiar la versión de Nginx), solo ejecutas:
Bash
```
helm upgrade mi-primer-release ./mi-sitio
```
Nota: Helm guarda el historial, por lo que si la actualización falla, puedes usar helm rollback para volver a la versión anterior al instante.

3. Desinstalar todo:
Borra de golpe el Deployment, el Service y todo lo asociado a ese paquete, dejando el clúster limpio.
Bash

helm uninstall mi-primer-release
