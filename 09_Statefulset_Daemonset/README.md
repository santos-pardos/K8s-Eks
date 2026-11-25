# DaemonSet y StatefulSet en Amazon EKS

¿Qué ocurre si añades un nodo al clúster? ¿Y si borras un pod que guarda una página web? En esta práctica desplegarás un agente por nodo y dos servidores Nginx. Después borrarás un pod de cada ejemplo para observar qué recupera Kubernetes.

| Fichero | Qué despliega | Qué observarás |
| --- | --- | --- |
| [daemonset.yaml](./daemonset.yaml) | Un agente BusyBox en cada nodo Linux elegible. | Con tres nodos elegibles verás tres agentes. Si añades un cuarto, aparecerá otro agente. |
| [statefulset.yaml](./statefulset.yaml) | Dos pods Nginx, un servicio interno y un directorio por réplica dentro del mismo Amazon EFS. | Los pods se llaman `web-efs-0` y `web-efs-1`. Si borras `web-efs-0`, su sustituto recupera ese nombre y su propia página. |

## 1. Preparar el clúster

Usa un clúster EKS estándar con un grupo de nodos EC2 Linux, acceso a las imágenes de Docker Hub y `kubectl` configurado. Basta con un nodo. Con dos podrás comparar la columna `NODE` en el primer ejercicio. Ejecuta los comandos desde la carpeta de los YAML en una terminal Bash.

Para el primer ejercicio basta con los nodos. El segundo requiere un sistema de archivos Amazon EFS y el complemento Amazon EFS CSI. En el apartado 3 encontrarás los requisitos y el único valor que debes personalizar en el YAML.

```bash
kubectl config current-context
kubectl get nodes -L kubernetes.io/os
kubectl create namespace lab-eks-sets --dry-run=client -o yaml | kubectl apply -f -
```

Comprueba que estás en el clúster de prácticas y que hay al menos un nodo Linux en estado `Ready`.

## 2. DaemonSet · un agente por nodo

El contenedor escribe cada diez segundos un mensaje con la hora y el nombre de su nodo. Es una versión mínima del patrón que utilizan los agentes de logs o métricas para trabajar en todos los nodos.

```bash
kubectl apply -f daemonset.yaml
kubectl -n lab-eks-sets rollout status daemonset/agente-nodo --timeout=2m
kubectl -n lab-eks-sets get daemonset agente-nodo
kubectl -n lab-eks-sets get pods -l app=agente-nodo -o wide
kubectl -n lab-eks-sets logs -l app=agente-nodo --prefix --tail=1
```

Compara `DESIRED` y `READY` con los nodos de la columna `NODE`. Con dos nodos Linux elegibles deberías ver dos pods, cada uno en un nodo distinto. La última orden muestra una línea por agente con el nombre del nodo en el que se ejecuta.

| Campo de `daemonset.yaml` | Para qué sirve |
| --- | --- |
| `selector.matchLabels` y `template.metadata.labels` | El controlador selecciona los pods con `app: agente-nodo`. La plantilla pone esa etiqueta en cada pod que crea. |
| `template.spec.nodeSelector` | La etiqueta `kubernetes.io/os: linux` selecciona los nodos Linux. El número de nodos elegibles determina el número de agentes. |
| `env[].valueFrom.fieldRef` | Kubernetes copia `spec.nodeName` en la variable `NODO`. El proceso la lee al escribir cada mensaje. |

**Prueba.** Elige automáticamente uno de los agentes, anota su nombre y su nodo, y bórralo.

```bash
POD=$(kubectl -n lab-eks-sets get pods -l app=agente-nodo -o jsonpath='{.items[0].metadata.name}')
kubectl -n lab-eks-sets get pod "$POD" -o wide
kubectl -n lab-eks-sets delete pod "$POD"
kubectl -n lab-eks-sets get pods -l app=agente-nodo -o wide --watch
```

Cuando el sustituto llegue a `Running`, pulsa **Ctrl+C**. Compara el nombre y el nodo con los que anotaste. El nuevo pod tiene otro sufijo y vuelve a cubrir el mismo nodo mientras siga disponible y sea elegible.

## 3. StatefulSet · una página por réplica en Amazon EFS

Piensa en EFS como un sistema de archivos al que pueden acceder varios nodos. En este ejercicio, cada réplica tendrá **su propia carpeta dentro del mismo EFS**. Así podrás guardar una página azul en una réplica y otra verde en la segunda. Kubernetes conserva la relación entre el nombre de cada réplica y su carpeta cuando reemplaza el pod.

### Preparar EFS

1. En la consola de **Amazon EFS**, abre un sistema de archivos regional de la misma VPC que los nodos EKS. En la pestaña **Red**, comprueba que haya un *mount target* disponible en cada zona de disponibilidad donde puedan ejecutarse los pods.
2. En el grupo de seguridad de los *mount targets*, permite la entrada **NFS, TCP 2049**, desde el grupo de seguridad de los nodos. Si has restringido la salida de los nodos, permite también TCP 2049 hacia el grupo de EFS.
3. En EKS, comprueba que el complemento **Amazon EFS CSI Driver** está activo. Su rol IAM debe poder crear y eliminar puntos de acceso. AWS proporciona la política `AmazonEFSCSIDriverPolicy`. La cuenta que despliega el YAML necesita permiso en Kubernetes para crear una `StorageClass`.
4. En [statefulset.yaml](./statefulset.yaml), sustituye `fs-REEMPLAZAR` en **`parameters.fileSystemId`** por el ID que muestra EFS. Por ejemplo, para un DNS con formato `fs-0123456789abcdef0.efs.us-east-1.amazonaws.com`, el valor sería `fs-0123456789abcdef0`. Guarda el cambio antes de aplicar el fichero.

Si ya desplegaste la práctica con EBS, puedes ejecutar esta versión en el mismo namespace. El nuevo StatefulSet se llama `web-efs` y crea sus propios PVC. Los datos de la práctica anterior siguen en sus volúmenes originales.

### Qué crea el manifiesto

| Recurso o campo | Para qué sirve |
| --- | --- |
| `StorageClass/lab-eks-sets-efs` | El controlador `efs.csi.aws.com` usa el modo `efs-ap` para crear un punto de acceso por PVC en el EFS indicado. Cada punto de acceso abre un directorio distinto bajo `/lab-eks-sets`. La opción `tls` cifra el tráfico de montaje. |
| `Service/web-efs-interna` | `clusterIP: None` crea un servicio *headless*. Su selector `app: web-efs` identifica los pods. Cada réplica recibe un nombre DNS propio dentro del clúster. |
| `StatefulSet/web-efs` | `replicas: 2` crea dos pods con nombres estables. `serviceName: web-efs-interna` los asocia al dominio DNS del servicio. |
| `volumeClaimTemplates` | A partir de la plantilla `datos`, Kubernetes crea un PVC por réplica. `ReadWriteMany` permite montar un volumen desde varios nodos. En este ejemplo, cada pod recibe un PVC diferente. |
| `volumeMounts` | Nginx ve la carpeta de su punto de acceso en `/usr/share/nginx/html`. El `1Gi` del PVC es una capacidad declarativa exigida por Kubernetes. EFS crece con los datos y ese valor no impone una cuota. |

| Pod | PVC que conserva | Nombre DNS desde el mismo namespace |
| --- | --- | --- |
| `web-efs-0` | `datos-web-efs-0` | `web-efs-0.web-efs-interna` |
| `web-efs-1` | `datos-web-efs-1` | `web-efs-1.web-efs-interna` |

### Desplegar y comprobar los puntos de acceso

```bash
kubectl get csidriver efs.csi.aws.com
kubectl apply -f statefulset.yaml
kubectl -n lab-eks-sets rollout status statefulset/web-efs --timeout=5m
kubectl -n lab-eks-sets get pods -l app=web-efs -o wide
kubectl -n lab-eks-sets get pvc datos-web-efs-0 datos-web-efs-1
```

Cuando ambos PVC estén en estado `Bound`, consulta a qué almacenamiento apunta cada uno. Un PVC es la solicitud del pod. El PV es el objeto que enlaza esa solicitud con EFS.

```bash
for PVC in datos-web-efs-0 datos-web-efs-1; do
  PV=$(kubectl -n lab-eks-sets get pvc "$PVC" -o jsonpath='{.spec.volumeName}')
  echo "$PVC → $PV"
  kubectl get pv "$PV" -o custom-columns='CONTROLADOR:.spec.csi.driver,VOLUMEN_EFS:.spec.csi.volumeHandle'
done
```

En ambas filas verás `efs.csi.aws.com` y un identificador con formato `fs-…::fsap-…`. Compara las dos partes. El **`fs-…` coincide** porque ambas réplicas utilizan el mismo EFS. El **`fsap-…` cambia** porque cada una tiene su propio punto de acceso.

### Escribir y leer una página por pod

Cada directorio empieza vacío. Antes de crear su `index.html`, Nginx puede devolver `403 Forbidden` al pedir la raíz. Escribe las páginas y luego solicita las dos desde `web-efs-1` usando el DNS interno.

```bash
kubectl -n lab-eks-sets exec web-efs-0 -- sh -c 'echo "Pagina del equipo azul" > /usr/share/nginx/html/index.html'
kubectl -n lab-eks-sets exec web-efs-1 -- sh -c 'echo "Pagina del equipo verde" > /usr/share/nginx/html/index.html'

kubectl -n lab-eks-sets exec web-efs-1 -- wget -qO- http://web-efs-0.web-efs-interna
kubectl -n lab-eks-sets exec web-efs-1 -- wget -qO- http://web-efs-1.web-efs-interna
```

La primera petición debe devolver `Pagina del equipo azul` y la segunda, `Pagina del equipo verde`.

### Borrar una réplica y comprobar qué conserva

```bash
kubectl -n lab-eks-sets get pod web-efs-0 -o custom-columns=NOMBRE:.metadata.name,UID:.metadata.uid
kubectl -n lab-eks-sets delete pod web-efs-0
kubectl -n lab-eks-sets wait --for=create pod/web-efs-0 --timeout=2m
kubectl -n lab-eks-sets wait --for=condition=Ready pod/web-efs-0 --timeout=5m

kubectl -n lab-eks-sets get pod web-efs-0 -o custom-columns=NOMBRE:.metadata.name,UID:.metadata.uid
kubectl -n lab-eks-sets get pvc datos-web-efs-0
kubectl -n lab-eks-sets exec web-efs-1 -- wget -qO- http://web-efs-0.web-efs-interna
```

Compara el UID antes y después. El pod nuevo tiene otro UID, recupera el nombre `web-efs-0`, monta el mismo PVC y vuelve a servir la página azul. Si acabas de recrearlo y el DNS todavía devuelve la dirección antigua, repite la última petición unos segundos después.

## Si el StatefulSet no arranca

```bash
kubectl -n lab-eks-sets describe pvc datos-web-efs-0
kubectl -n lab-eks-sets describe pod web-efs-0
kubectl -n lab-eks-sets get events --sort-by=.metadata.creationTimestamp
```

| Síntoma | Qué revisar |
| --- | --- |
| `csidriver ... not found` | Comprueba la instalación del complemento Amazon EFS CSI en ese clúster. |
| PVC en `Pending` con `FailedProvisioning` | Lee el evento del PVC. Un error de sistema de archivos apunta al `fileSystemId` o a la región. Si aparece `AccessDenied`, revisa el rol IAM del controlador y sus permisos sobre los puntos de acceso. |
| PVC en `Bound` y pod en `ContainerCreating` con `FailedMount` | El volumen ya está asignado. Comprueba el *mount target* de la zona del nodo, el DNS de la VPC y la regla TCP 2049 entre nodos y EFS. |

## 4. Limpiar la práctica

Estas órdenes eliminan las dos réplicas, el servicio, los PVC de EFS y la StorageClass de este ejercicio. **Ejecuta el borrado de los PVC cuando hayas terminado con sus datos.** La política `Delete` solicita al controlador que elimine los puntos de acceso. De forma predeterminada, el controlador deja sus directorios y ficheros en EFS. Si está configurado con `delete-access-point-root-dir=true`, elimina también esos directorios. El sistema de archivos EFS sigue existiendo.

```bash
kubectl -n lab-eks-sets scale statefulset/web-efs --replicas=0
kubectl -n lab-eks-sets wait --for=delete pod -l app=web-efs --timeout=5m
kubectl -n lab-eks-sets delete statefulset web-efs
kubectl -n lab-eks-sets delete service web-efs-interna
kubectl -n lab-eks-sets delete pvc datos-web-efs-0 datos-web-efs-1
kubectl delete storageclass lab-eks-sets-efs
```

Si hiciste también el ejercicio del agente, elimínalo con `kubectl delete -f daemonset.yaml`.

## Documentación oficial

- [Kubernetes · DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)
- [Kubernetes · StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Amazon EKS · Configurar Amazon EFS CSI](https://docs.aws.amazon.com/eks/latest/userguide/efs-csi.html)
- [Amazon EFS · Grupos de seguridad y puerto NFS](https://docs.aws.amazon.com/efs/latest/ug/network-access.html)
- [Amazon EFS CSI · Parámetros de aprovisionamiento y limpieza](https://github.com/kubernetes-sigs/aws-efs-csi-driver/blob/master/docs/parameters.md)
