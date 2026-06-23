Requisitos previos

Asumo que ya tienes:

    Tu clúster EKS funcionando.

    kubectl configurado y apuntando a tu clúster.

    helm instalado en tu terminal.

Paso 1: Añadir el repositorio de Helm

Primero, necesitas decirle a Helm dónde encontrar los paquetes oficiales de la comunidad de Prometheus y actualizar tu lista local.

Ejecuta en tu terminal:
Bash
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```
Paso 2: Instalar el Stack

Es una buena práctica instalar las herramientas de monitoreo en su propio "espacio de trabajo" o Namespace. Lo llamaremos monitoring.

Ejecuta el siguiente comando (Helm creará el namespace automáticamente por ti):
Bash
```
helm install kube-prom prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```
Nota: kube-prom es el nombre de tu Release (puedes ponerle el que quieras).

Espera un par de minutos mientras se descargan las imágenes. Puedes verificar que los Pods se están levantando con:
Bash
```
kubectl get pods -n monitoring
```
Paso 3: Obtener la contraseña de Grafana

Por defecto, Helm crea una contraseña segura y aleatoria para el usuario administrador (admin) de Grafana y la guarda en un Secret de Kubernetes.

Para extraerla y decodificarla, ejecuta:
Bash
```
kubectl get secret -n monitoring kube-prom-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```
Copia la contraseña que te devuelve este comando, la necesitarás en el siguiente paso.
Paso 4: Acceder a la interfaz de Grafana

Como los servicios están dentro de tu clúster de EKS en AWS, no están expuestos a Internet por defecto (lo cual es bueno para la seguridad). Para acceder rápidamente desde tu navegador local, usaremos port-forward.

Ejecuta:
Bash
```
kubectl port-forward --address=0.0.0.0 -n monitoring svc/kube-prom-grafana 8080:80
```
¡Listo! Ahora sigue estos pasos:

    Abre tu navegador web y ve a: 
    ```
    http://public-IP:8080
    ```
    Usuario: admin

    Contraseña: La que obtuviste en el Paso 3.

Verás que Grafana ya viene con docenas de paneles preconfigurados si vas a la sección de Dashboards > General. Podrás ver el uso de CPU, RAM, red y estado de los Nodos de tu EKS de manera inmediata.
(Opcional) Acceder a la interfaz de Prometheus

Si en algún momento necesitas hacer consultas directas (PromQL) en la interfaz cruda de Prometheus, puedes hacer otro port-forward en una terminal nueva:
Bash
```
kubectl port-forward --address=0.0.0.0 -n monitoring svc/kube-prom-kube-prometheus-prometheus 9090:9090
```
Y acceder en tu navegador a: http://localhost:9090


Pasos para importar un Dashboard en Grafana

1. Entrar a la sección de importación:
En el menú izquierdo de Grafana, haz clic en el icono de Dashboards (los cuatro cuadritos) y, en la esquina superior derecha, haz clic en el botón New -> Import.

2. Poner el ID del Dashboard:
Grafana tiene una web oficial (grafana.com/dashboards) con miles de paneles listos para usar. En la casilla que dice "Import via grafana.com", escribe el número 3119 (o el 15759, que es otro muy moderno).
Haz clic en el botón Load (Cargar).

3. Configurar el origen de los datos (Data Source):
Te aparecerá una pantalla con las opciones del Dashboard.

    Puedes dejar el nombre tal como está.

    En la parte inferior, verás un campo desplegable llamado Prometheus (o prometheus data sources). Haz clic ahí y selecciona la opción Prometheus (es el origen de datos que Helm ya configuró por ti).

4. Importar y visualizar:
Haz clic en el botón verde Import.

¡Y listo! Automáticamente serás redirigido a tu nuevo panel. Empezarás a ver gráficas en tiempo real mostrando la CPU, Memoria, uso de red y el estado de todos los Nodos y Pods de tu clúster de AWS EKS.

```
helm uninstall kube-prom -n monitoring
```
```
kubectl delete namespace monitoring
```
