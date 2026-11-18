# Nginx en Kubernetes: volúmenes emptyDir y hostPath

Dos prácticas sencillas para comprender cómo utiliza almacenamiento un pod Nginx y qué ocurre con sus archivos al reemplazarlo. Se pueden realizar en EKS con nodos Linux EC2 o en otro clúster Kubernetes con nodos Linux.

## Archivos

- `nginx-emptydir.yaml`: Deployment con un volumen temporal asociado al pod.
- `nginx-hostpath.yaml`: Deployment con una carpeta del nodo montada en el pod.
- `README.md`: instrucciones de despliegue y pruebas.

Ambos ejemplos utilizan una réplica y **no necesitan PV, PVC, EFS ni Service**. Accedemos a la aplicación con `kubectl port-forward`, sin crear balanceadores de AWS.

## Requisitos

- Clúster en funcionamiento y `kubectl` configurado con permisos para crear Deployments y acceder a los pods.
- Nodos Linux con acceso a la imagen `nginx:1.27`.
- En el ejemplo hostPath, el clúster debe permitir ese tipo de volumen y el nodo debe poder crear la carpeta indicada. Algunas políticas o entornos, como EKS Fargate, no admiten hostPath.

Comprueba tu contexto y nodos:

```bash
kubectl config current-context
kubectl get nodes -o wide
```

Ejecuta los comandos desde la carpeta donde están los YAML. Todos los recursos se crean en el espacio de nombres activo; usa el mismo en todos los comandos.

> Al montar un volumen sobre `/usr/share/nginx/html`, queda oculta la página original de Nginx. Si la carpeta montada está vacía, inicialmente puede aparecer **403 Forbidden**. Crearemos un `index.html` en cada práctica.

## 1. Nginx con emptyDir

`emptyDir` crea un directorio inicialmente vacío asociado al pod. Los contenedores del mismo pod pueden compartirlo. Si solo se reinicia el contenedor, sus archivos permanecen; si se elimina el pod, se elimina su volumen.

### Despliegue

```bash
kubectl apply -f nginx-emptydir.yaml
kubectl rollout status deployment/nginx-emptydir --timeout=180s
kubectl get pods -l app=nginx-emptydir -o wide
```

En el YAML, `volumes` declara `datos-web` como `emptyDir`; `volumeMounts` usa el mismo nombre y lo monta en `/usr/share/nginx/html`.

### Crear y visualizar la página

```bash
POD_EMPTY=$(kubectl get pods -l app=nginx-emptydir -o jsonpath='{.items[0].metadata.name}')
kubectl exec "$POD_EMPTY" -- sh -c 'echo "<h1>Hola desde emptyDir</h1>" > /usr/share/nginx/html/index.html'
kubectl exec "$POD_EMPTY" -- cat /usr/share/nginx/html/index.html
```

Este comando escribe o sobrescribe `index.html` en el volumen de la práctica. Accede a la web:

```bash
kubectl port-forward deployment/nginx-emptydir 8080:80 --address 0.0.0.0
```

Abre **http://localhost:8080** en el navegador del equipo donde se ejecuta `kubectl`. Si lo ejecutas en una máquina remota, `localhost` se refiere a esa máquina; puedes usar `curl http://localhost:8080` allí. Detén el acceso con `Ctrl+C`.

### Comprobar qué ocurre al eliminar el pod

```bash
kubectl delete pod "$POD_EMPTY"
kubectl rollout status deployment/nginx-emptydir --timeout=180s
POD_EMPTY=$(kubectl get pods -l app=nginx-emptydir -o jsonpath='{.items[0].metadata.name}')
kubectl exec "$POD_EMPTY" -- ls -la /usr/share/nginx/html
```

El Deployment crea otro pod, con un `emptyDir` nuevo y vacío: **la página anterior ya no aparece**. Puedes repetir el `port-forward` y comprobar el 403 inicial.

## 2. Nginx con hostPath

`hostPath` monta una carpeta del nodo dentro del pod. En este ejemplo, `/datos/nginx-hostpath` del nodo se monta en `/usr/share/nginx/html` del contenedor. Si no existe la carpeta del nodo, `DirectoryOrCreate` intenta crearla.

> Usa este ejemplo solo en un entorno de laboratorio y con nodos de pruebas: un pod con acceso al sistema de archivos del nodo puede tener implicaciones de seguridad. No uses una ruta que contenga datos importantes.

### Despliegue

```bash
kubectl apply -f nginx-hostpath.yaml
kubectl rollout status deployment/nginx-hostpath --timeout=180s
kubectl get pods -l app=nginx-hostpath -o wide
```

Anota el valor de la columna **NODE**. La carpeta pertenece a ese nodo, no a todos los nodos del clúster.

### Crear y visualizar la página

```bash
POD_HOST=$(kubectl get pods -l app=nginx-hostpath -o jsonpath='{.items[0].metadata.name}')
kubectl exec "$POD_HOST" -- ls -la /usr/share/nginx/html
```

Comprueba que la carpeta es de pruebas. El siguiente comando **sobrescribe** `index.html` si ya existe:

```bash
kubectl exec "$POD_HOST" -- sh -c 'echo "<h1>Hola desde hostPath</h1>" > /usr/share/nginx/html/index.html'
kubectl exec "$POD_HOST" -- cat /usr/share/nginx/html/index.html
```

```bash
kubectl port-forward deployment/nginx-hostpath 8081:80 --address 0.0.0.0
```

Abre **http://localhost:8081** en el equipo que ejecuta `kubectl`; si es remoto, usa `curl http://localhost:8081` en esa máquina. Detén el acceso con `Ctrl+C`.

### Comprobar qué ocurre al eliminar el pod

```bash
kubectl get pod "$POD_HOST" -o wide
kubectl delete pod "$POD_HOST"
kubectl rollout status deployment/nginx-hostpath --timeout=180s
POD_HOST=$(kubectl get pods -l app=nginx-hostpath -o jsonpath='{.items[0].metadata.name}')
kubectl get pod "$POD_HOST" -o wide
kubectl exec "$POD_HOST" -- ls -la /usr/share/nginx/html
```

- **Mismo nodo:** debería seguir apareciendo `index.html` en la carpeta existente.
- **Otro nodo:** se monta la carpeta de ese otro nodo; puede estar vacía o contener otros datos. Una ruta con el mismo nombre no es un almacenamiento compartido.
- Si el nodo original se elimina o se reemplaza, sus datos locales pueden perderse.

## Comparación

| Situación | emptyDir | hostPath | EFS con PV y PVC |
|---|---|---|---|
| Ubicación | Volumen temporal asociado al pod | Carpeta de un nodo | Sistema de archivos EFS |
| Reinicio del contenedor en el mismo pod | Conserva los datos | Conserva los datos del nodo | Conserva los datos en EFS |
| Eliminación del pod | Se elimina el volumen | La carpeta normalmente permanece en el nodo | Los datos permanecen en EFS |
| Pod nuevo en otro nodo | Volumen vacío nuevo | Accede a la carpeta del otro nodo | Puede acceder a los mismos datos si tiene conectividad y permisos |

## Problemas habituales

- **403 Forbidden:** comprueba que existe `index.html` y que Nginx puede leerlo con `kubectl exec NOMBRE_DEL_POD -- ls -la /usr/share/nginx/html`.
- **Permission denied:** revisa los permisos de la carpeta del nodo en el caso de `hostPath`. Evita dar permisos amplios sin comprobar el entorno.
- **Pod pendiente o que no arranca:** consulta `kubectl describe pod NOMBRE_DEL_POD` y sus eventos; revisa políticas, imagen y nodos.
- **La página no aparece en el nuevo pod hostPath:** compara los nodos mediante `kubectl get pods -o wide`.

## Limpieza

```bash
kubectl delete -f nginx-emptydir.yaml
kubectl delete -f nginx-hostpath.yaml
```

Al borrar el Deployment `hostPath`, **la carpeta `/datos/nginx-hostpath` y sus archivos pueden permanecer en el nodo**. Si se desea borrarla, identifica el nodo correcto, comprueba su contenido y elimínala allí cuando ya no sea necesaria. El borrado del Deployment no elimina EFS ni afecta al ejemplo anterior.

## Documentación

- [Volúmenes en Kubernetes: emptyDir y hostPath](https://kubernetes.io/docs/concepts/storage/volumes/)
