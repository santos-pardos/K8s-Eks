# Práctica EKS + EFS


## Requisitos

Clúster EKS con nodos EC2 Linux, kubectl configurado, EFS CSI Driver instalado y EFS con mount targets accesibles. Comprueba `kubectl get nodes` y `kubectl get csidriver`. El montaje requiere DNS, conectividad TCP 2049 y permisos de EFS y POSIX adecuados. El Service LoadBalancer requiere configuración y permisos de AWS y puede generar costes. EFS también puede generar costes.

## Despliegue

```bash
kubectl apply -f 01-pv-efs.yaml
kubectl apply -f 02-pvc-efs.yaml
kubectl get pv,pvc
kubectl apply -f 03-deployment-nginx.yaml
kubectl rollout status deployment/nginx-efs --timeout=180s
kubectl apply -f 04-service-nginx.yaml
kubectl get pods -o wide
kubectl get svc nginx-efs-service
```

Cuando el PVC esté Bound y los pods Running, crea la página si no existe. El montaje de EFS oculta la página original de la imagen Nginx. El comando siguiente protege un index.html existente: no lo sustituye.

```bash
POD1=$(kubectl get pods -l app=nginx-efs -o jsonpath='{.items[0].metadata.name}')
kubectl exec "$POD1" -- sh -c 'if [ -e /usr/share/nginx/html/index.html ]; then echo "Ya existe index.html; no se ha modificado"; else printf "<h1>Aplicacion EKS con EFS</h1><p>Pagina compartida entre los pods de Nginx.</p>\n" > /usr/share/nginx/html/index.html; fi'
POD2=$(kubectl get pods -l app=nginx-efs -o jsonpath='{.items[1].metadata.name}')
kubectl exec "$POD2" -- cat /usr/share/nginx/html/index.html
```

Abre en el navegador `http://<direccion-del-balanceador>` utilizando la dirección de `kubectl get svc nginx-efs-service`. Según la configuración del clúster el balanceador puede ser interno. Alternativa local: `kubectl port-forward svc/nginx-efs-service 8080:80` y abrir http://localhost:8080.

Prueba de persistencia: `kubectl delete pods -l app=nginx-efs`, espera con `kubectl rollout status deployment/nginx-efs` y vuelve a cargar la página. Tener dos nodos no garantiza que los pods queden en nodos distintos; compruébalo con `kubectl get pods -o wide`.

Si el PVC está Pending: `kubectl describe pvc efs-pvc`. Si un pod está en ContainerCreating: `kubectl describe pod NOMBRE` y revisa eventos FailedMount, CSI, DNS, mount targets, red y permisos. Si hay Permission denied, revisa permisos POSIX y política de EFS. Si el Service está Pending: `kubectl describe svc nginx-efs-service`.

## Limpieza

```bash
kubectl delete -f 04-service-nginx.yaml
kubectl delete -f 03-deployment-nginx.yaml
kubectl delete -f 02-pvc-efs.yaml
kubectl delete -f 01-pv-efs.yaml
```

Comprueba en AWS que el balanceador se haya eliminado. El sistema EFS y sus archivos no se eliminan con estos comandos. La política del PV es Retain.


## Solución del error 403 Forbidden en Nginx con EFS

Al acceder a la aplicación puede aparecer:

```text
403 Forbidden
nginx/1.27.5
```

Esto indica que una petición ha llegado a Nginx, pero no identifica por sí solo la causa. En esta práctica, una causa frecuente es que el directorio web montado desde EFS no contenga un archivo `index.html`, o que Nginx no pueda acceder a él.

### ¿Por qué puede ocurrir?

En el Deployment se monta EFS en la carpeta web de Nginx:

```yaml
volumeMounts:
  - name: volumen-web
    mountPath: /usr/share/nginx/html
```

El montaje oculta los archivos que la imagen traía en esa ruta. Si el EFS está vacío, la página de bienvenida original no estará visible y Nginx puede responder con 403 al solicitar `/`.

> Esta práctica monta la raíz del EFS. Si contiene datos previos, revísalos antes de escribir. El comando siguiente no sobrescribe un `index.html` existente.

### 1. Comprueba los pods

```bash
kubectl get pods -l app=nginx-efs -o wide
```

Espera a que los dos pods estén `Running` y `1/1`. Si no lo están, consulta sus eventos con `kubectl describe pod NOMBRE_DEL_POD`.

### 2. Inspecciona la carpeta web

Selecciona uno de los pods:

```bash
POD1=$(kubectl get pods -l app=nginx-efs -o jsonpath='{.items[0].metadata.name}')
echo "$POD1"
```

Lista sus archivos:

```bash
kubectl exec "$POD1" -- ls -la /usr/share/nginx/html
```

Si `index.html` no aparece, puedes crear la página de prueba.

### 3. Crea la página si no existe

```bash
kubectl exec "$POD1" -- sh -c 'if [ -e /usr/share/nginx/html/index.html ]; then
  echo "Ya existe index.html; no se ha modificado"
else
  printf "<h1>Aplicacion EKS con EFS</h1><p>Pagina compartida entre los pods de Nginx.</p>\n" > /usr/share/nginx/html/index.html && echo "Pagina creada"
fi'
```

Comprueba su contenido:

```bash
kubectl exec "$POD1" -- cat /usr/share/nginx/html/index.html
```

Accede de nuevo a la dirección del balanceador. Si no la recuerdas:

```bash
kubectl get svc nginx-efs-service
```

Abre `http://DIRECCION-DEL-BALANCEADOR`.

### 4. Comprueba que el segundo pod ve el archivo

```bash
POD2=$(kubectl get pods -l app=nginx-efs -o jsonpath='{.items[1].metadata.name}')
echo "$POD2"
kubectl exec "$POD2" -- cat /usr/share/nginx/html/index.html
```

Si muestra el mismo contenido, ambos pods acceden al archivo compartido en EFS. Consulta `kubectl get pods -o wide` para ver si se encuentran en el mismo nodo o en nodos distintos.

### 5. Si continúa el error

Comprueba permisos y registros de ambos pods:

```bash
kubectl exec "$POD1" -- ls -ld /usr/share/nginx/html
kubectl exec "$POD1" -- ls -l /usr/share/nginx/html/index.html
kubectl logs "$POD1" --tail=30
kubectl logs "$POD2" --tail=30
```

- Si el registro indica `directory index ... is forbidden`, revisa si existe `index.html` y la configuración de Nginx.
- Si indica `Permission denied`, revisa los permisos POSIX del archivo y del directorio en EFS y las políticas de acceso aplicables.
- Si no puedes crear el archivo por `Permission denied`, revisa los permisos de escritura; evita cambiar indiscriminadamente los permisos de todo el EFS.
- Si un pod está en `ContainerCreating`, usa `kubectl describe pod NOMBRE_DEL_POD` para comprobar posibles errores `FailedMount`.

Un **404 Not Found** es diferente: normalmente indica que Nginx no encuentra la ruta o el archivo solicitado. Comprueba la URL, el nombre del fichero y los registros de Nginx.

### 6. Prueba de persistencia

Una vez funcione la página, elimina los pods:

```bash
kubectl delete pods -l app=nginx-efs
kubectl rollout status deployment/nginx-efs --timeout=180s
kubectl get pods -l app=nginx-efs -o wide
```

El Deployment creará otros. Al volver a acceder a la web, la página debería seguir disponible porque está guardada en EFS. La prueba requiere que los nuevos pods puedan montar ese mismo sistema de archivos.

