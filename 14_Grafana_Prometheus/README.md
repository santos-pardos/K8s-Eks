Requisitos previos

Asumo que ya tienes:

    Tu clúster EKS funcionando.

    kubectl configurado y apuntando a tu clúster.

    helm instalado en tu terminal.

🚀 Paso 1: Añadir el repositorio de Helm

Primero, necesitas decirle a Helm dónde encontrar los paquetes oficiales de la comunidad de Prometheus y actualizar tu lista local.

Ejecuta en tu terminal:
Bash

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

📦 Paso 2: Instalar el Stack

Es una buena práctica instalar las herramientas de monitoreo en su propio "espacio de trabajo" o Namespace. Lo llamaremos monitoring.

Ejecuta el siguiente comando (Helm creará el namespace automáticamente por ti):
Bash

helm install kube-prom prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

Nota: kube-prom es el nombre de tu Release (puedes ponerle el que quieras).

Espera un par de minutos mientras se descargan las imágenes. Puedes verificar que los Pods se están levantando con:
Bash

kubectl get pods -n monitoring

🔐 Paso 3: Obtener la contraseña de Grafana

Por defecto, Helm crea una contraseña segura y aleatoria para el usuario administrador (admin) de Grafana y la guarda en un Secret de Kubernetes.

Para extraerla y decodificarla, ejecuta:
Bash

kubectl get secret -n monitoring kube-prom-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

Copia la contraseña que te devuelve este comando, la necesitarás en el siguiente paso.
🌐 Paso 4: Acceder a la interfaz de Grafana

Como los servicios están dentro de tu clúster de EKS en AWS, no están expuestos a Internet por defecto (lo cual es bueno para la seguridad). Para acceder rápidamente desde tu navegador local, usaremos port-forward.

Ejecuta:
Bash

kubectl port-forward -n monitoring svc/kube-prom-grafana 8080:80

¡Listo! Ahora sigue estos pasos:

    Abre tu navegador web y ve a: http://localhost:8080

    Usuario: admin

    Contraseña: La que obtuviste en el Paso 3.

Verás que Grafana ya viene con docenas de paneles preconfigurados si vas a la sección de Dashboards > General. Podrás ver el uso de CPU, RAM, red y estado de los Nodos de tu EKS de manera inmediata.
💡 (Opcional) Acceder a la interfaz de Prometheus

Si en algún momento necesitas hacer consultas directas (PromQL) en la interfaz cruda de Prometheus, puedes hacer otro port-forward en una terminal nueva:
Bash

kubectl port-forward -n monitoring svc/kube-prom-kube-prome-prometheus 9090:9090

Y acceder en tu navegador a: http://localhost:9090