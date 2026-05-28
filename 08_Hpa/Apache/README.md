## Apache en K8s y HPA

Paso 1: Crear la aplicación (Deployment)

Primero necesitamos algo que ejecutar. Vamos a levantar un servidor web Apache muy simple (httpd).

Muy importante: Para que el HPA funcione, tienes que definir los resources.requests.cpu. Si Kubernetes no sabe cuánta CPU pide tu Pod por defecto, el HPA no sabrá calcular los porcentajes y fallará.

Guarda esto como app.yaml y aplícalo:
YAML
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mi-web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: apache
        image: registry.k8s.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "200m" # El Pod pide el 20% de un núcleo de CPU
```
(Para aplicarlo: k apply -f app.yaml)

Paso 2: Crear el HPA

Ahora creamos la regla de auto-escalado. Le diremos a Kubernetes: "Mantén este Deployment entre 1 y 5 réplicas. Si la media de CPU de los Pods supera el 50% de lo que pidieron (es decir, más de 100m), crea más Pods".

Guarda esto como hpa.yaml y aplícalo:
YAML
```
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mi-web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mi-web # A qué aplicación vigila
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50 # Objetivo: 50% de uso de CPU
```
(Para aplicarlo: k apply -f hpa.yaml)
Paso 3:  (Estresar el Pod)

Si ejecutas k get hpa, verás que el consumo actual está en 0%/50% porque nadie está usando la web.

Vamos a abrir una terminal nueva y a meterle caña introduciendo un bucle infinito de peticiones HTTP para simular miles de visitas. Ejecuta este comando:
Bash
```
k run -i --tty --rm load-generator --image=busybox --restart=Never -- /bin/sh -c "while true; do wget -q -O- http://mi-web; done"
```
¿Qué pasará ahora?

Deja ese comando corriendo y, en otra pestaña de tu terminal, vigila el HPA con el comando watch (-w):
Bash
```
k get hpa -w
```
Verás cómo cambian los números en cuestión de un par de minutos:

    El consumo de CPU subirá drásticamente: 250%/50%.

    El HPA reaccionará alterando la columna de REPLICAS: pasará de 1 a 3, y luego a 5 (el máximo que le pusimos).

    Si haces un k get pods, verás que ahora tienes 5 Pods idénticos de mi-web repartiéndose ese ataque de tráfico.

Si cortas el comando del generador de carga (Ctrl + C), verás que tras unos minutos de calma, el HPA volverá a bajar de forma segura las réplicas a 1. ¡Magia!

## ERROR: wget: bad address 'mi-web'  y SOLUCION
---------------------------
Paso 1: Crear el Servicio

Ejecuta este comando rápido en tu terminal (usando tu alias k):
Bash
```
k expose deployment mi-web --port=80 --target-port=80
```
Este comando le dice a Kubernetes: "Crea un servicio llamado mi-web que reciba tráfico en el puerto 80 y lo redirija al puerto 80 de los Pods con la etiqueta de mi aplicación".
Paso 2: Volver a lanzar el ataque de estrés

Ahora que el servicio existe, vuelve a ejecutar el comando para estresar el Pod:
Bash
```
k run -i --tty --rm load-generator --image=busybox --restart=Never -- /bin/sh -c "while true; do wget -q -O- http://mi-web; done"
```
Por qué ahora sí va a funcionar?

Antes, cuando ejecutabas wget http://mi-web, el contenedor de BusyBox le preguntaba al servidor DNS interno de Kubernetes: "¿Quién es mi-web?", y el DNS respondía: "No tengo ni idea" (bad address).

Ahora, gracias al comando k expose, el DNS de Kubernetes ya conoce la dirección de mi-web y redirigirá todo ese bucle infinito de peticiones directamente hacia tu Pod de Apache. Si abres otra pestaña y ejecutas k get hpa -w, verás cómo en un par de minutos la CPU empieza a subir y las réplicas se multiplican.

¿Qué hace exactamente el comando k expose?

El comando k expose es el equivalente a poner una centralita telefónica con un número fijo en la recepción del edificio.

Cuando ejecutaste:
Bash
```
k expose deployment mi-web --port=80 --target-port=80
```
Kubernetes hizo tres cosas de forma automática entre bambalinas:

    Creó un objeto llamado "Service" (Servicio): Le asignó un nombre fijo e inmortal en el clúster: mi-web. Este nombre nunca va a cambiar.

    Le dio una IP fija interna (ClusterIP): Una dirección que nunca cambia, pase lo que pase con los Pods.

    Puso un cartel luminoso (Labels/Selectors): El servicio se queda vigilando el clúster buscando cualquier Pod que tenga la etiqueta app: web.

El viaje de tu comando wget (Ahora sí)

Cuando volviste a lanzar el generador de carga con wget http://mi-web, el flujo fue el siguiente:

    Tu Pod de BusyBox llamó a http://mi-web.

    El DNS de Kubernetes dijo: "¡Ah, sí! mi-web es la centralita (el Servicio) que está en la IP 10.100.0.5".

    El Servicio recibió la avalancha de peticiones de tu ataque de estrés.

    El Servicio miró su lista de Pods asociados y dijo: "Tengo que mandar este tráfico al Pod de Apache".

Y aquí viene la magia con el HPA: Como el Servicio empezó a redirigir miles de peticiones al Pod de Apache, la CPU de ese Pod se disparó. El HPA lo vio, creó 4 Pods más, y el Servicio (automáticamente y en milisegundos) detectó los nuevos Pods y empezó a repartir el tráfico del wget entre los 5 Pods para que ninguno se cayera.

En resumen: expose sirve para crear una puerta de acceso fija y darle un nombre oficial a tu aplicación para que otros Pods del clúster puedan hablar con ella.
