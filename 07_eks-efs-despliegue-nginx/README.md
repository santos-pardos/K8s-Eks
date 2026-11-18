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
