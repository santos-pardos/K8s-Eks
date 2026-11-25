# Escalado automático de pods con HPA en Amazon EKS

Una web del centro recibe pocas visitas durante el día. Al abrirse el plazo de matrícula, muchas personas entran a la vez. ¿Cómo puede Kubernetes añadir copias de la web mientras dura el pico y volver después a una sola?

En esta práctica desplegarás una web interna que hace un cálculo en cada petición. Generarás tráfico desde otro pod y observarás cómo el **HorizontalPodAutoscaler (HPA)** ajusta el número de réplicas del Deployment entre **1 y 4**, con un objetivo de CPU media del **50 %**. Un único nodo Linux con capacidad libre es suficiente para observar el ejercicio.

## 1. Qué crea el fichero

Los tres recursos están en [hpa.yaml](./hpa.yaml), separados por `---`. Todos pertenecen al namespace `lab-hpa`.

| Recurso | Qué hace | Cómo se enlaza |
| --- | --- | --- |
| **Deployment** `web-cpu` | Crea los pods de la web. Cada petición realiza el mismo cálculo y devuelve el nombre del pod que la atendió. | Su plantilla etiqueta cada pod con `app: web-cpu`. Al crear el Deployment, Kubernetes empieza con una réplica. |
| **Service** `web-cpu` | Proporciona la dirección interna `http://web-cpu` en este namespace. Recibe tráfico en el puerto 80 y lo envía al 8080 de los pods disponibles. | Su `selector` busca la etiqueta `app: web-cpu`. Esto incluye las nuevas réplicas cuando están listas. |
| **HorizontalPodAutoscaler** `web-cpu` | Consulta la utilización media de CPU y ajusta la cantidad de réplicas. | `scaleTargetRef` apunta al recurso de tipo `Deployment` llamado `web-cpu`. El Deployment se ocupa de crear o retirar los pods. |

### ¿Qué significa el 50 %?

Cada pod solicita `100m` de CPU, es decir, una décima parte de un núcleo. El HPA calcula el porcentaje sobre **esa cantidad solicitada**. Por tanto, el 50 % equivale a **50m por pod de media**. El límite de `300m` indica cuánto puede consumir cada contenedor cuando tiene trabajo.

Por ejemplo, si hay **2 pods** y cada uno consume **75m**, la media es el **75 %** de lo solicitado. Un cálculo orientativo del HPA es `2 × 75 / 50 = 3` réplicas. El valor real depende también de las muestras disponibles y de si los pods nuevos están listos.

| Campo en el HPA | Valor | Efecto que observarás |
| --- | --- | --- |
| `minReplicas` | `1` | Queda una réplica disponible cuando termina el tráfico. |
| `maxReplicas` | `4` | La web puede crecer hasta cuatro réplicas. |
| `averageUtilization` | `50` | El HPA intenta acercar la utilización media de CPU al 50 % de la solicitada. |
| `scaleDown.stabilizationWindowSeconds` | `60` | Al reducir réplicas, el HPA conserva la recomendación más alta del último minuto. Así evita retirar pods por una caída breve de tráfico. |

## 2. Preparar EKS y las métricas

Necesitas acceso al clúster con `kubectl`, permisos para trabajar en el namespace del laboratorio y nodos Linux que puedan descargar las imágenes de Python y BusyBox. Ejecuta los comandos desde la carpeta que contiene `hpa.yaml`.

```bash
kubectl config current-context
kubectl get nodes
kubectl top nodes
```

Comprueba que estás en el clúster de prácticas, que al menos un nodo figura como `Ready` y que la última orden devuelve cifras de CPU y memoria. **Metrics Server** recoge las métricas que necesita el HPA. Si `kubectl top nodes` indica `Metrics API not available`, comprueba si ya hay una instalación en curso. Si falta, en la consola de EKS abre tu clúster y elige **Add-ons → Get more add-ons → Community add-ons → Metrics Server**. Una vez activo, espera a la primera muestra y repite `kubectl top nodes`. En un clúster compartido, el docente puede hacer esta preparación una sola vez.

## 3. Desplegar y medir en reposo

```bash
kubectl create namespace lab-hpa --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f hpa.yaml
kubectl -n lab-hpa rollout status deployment/web-cpu --timeout=3m
kubectl -n lab-hpa get deployment,service,hpa
kubectl -n lab-hpa top pods -l app=web-cpu
```

En reposo deberías ver **una réplica**. Durante las primeras muestras, la columna `TARGETS` de `kubectl get hpa` puede mostrar `<unknown>/50%`. Espera a ver una cifra antes de empezar la carga. Un valor como `2%/50%` significa «2 % de utilización media observada, 50 % de objetivo».

## 4. Generar tráfico y observar la subida

Abre **dos terminales** conectadas al mismo clúster.

**Terminal A.** Deja esta orden en ejecución para ver los cambios de `TARGETS` y `REPLICAS`.

```bash
kubectl -n lab-hpa get hpa web-cpu --watch
```

**Terminal B.** Crea un pod cliente que envía peticiones al servicio interno durante un máximo aproximado de cinco minutos. Puedes detenerlo antes en el paso 5. Cada petición hace que la web consuma CPU.

```bash
kubectl -n lab-hpa run carga --image=busybox:1.37.0 --restart=Never --command -- sh -c '
  fin=$(( $(date +%s) + 300 ))
  while [ "$(date +%s)" -lt "$fin" ]; do
    wget -T 5 -qO- http://web-cpu || exit 1
    sleep 0.02
  done'
```

Cuando el cliente esté en marcha, usa esa misma terminal para ver qué pod responde, cuánta CPU consume cada réplica y qué decisiones ha tomado el HPA.

```bash
kubectl -n lab-hpa logs carga --tail=5
kubectl -n lab-hpa top pods -l app=web-cpu
kubectl -n lab-hpa get pods -l app=web-cpu -o wide
kubectl -n lab-hpa describe hpa web-cpu
```

En la terminal A, observa cómo la CPU supera el objetivo y, después de varias muestras, aumenta el número de réplicas. En los eventos de `describe hpa` puedes encontrar `SuccessfulRescale`. **La prueba de subida se cumple cuando hay más de una réplica**. El número exacto dependerá de la carga y del clúster. El pod `carga` es el cliente y queda fuera del recuento del Deployment.

## 5. Retirar el tráfico y observar la bajada

En la **terminal B**, cuando hayas observado la subida, borra el cliente.

```bash
kubectl -n lab-hpa delete pod carga --ignore-not-found
```

Sigue mirando la terminal A. Primero bajará el uso de CPU. Después, cuando pasen la ventana de estabilización de 60 segundos y los ciclos de medición necesarios, el HPA debería volver a **una réplica**. Pulsa **Ctrl+C** para salir de la vista en directo y comprueba el resultado final.

```bash
kubectl -n lab-hpa get hpa web-cpu
kubectl -n lab-hpa get deployment web-cpu
kubectl -n lab-hpa get pods -l app=web-cpu
```

Para discutir en clase: si el HPA solicita cuatro réplicas y el nodo solo tiene recursos para dos, ¿qué verás? El Deployment solicitará los pods adicionales, pero algunos pueden quedar en `Pending`. El **HPA cambia el número de pods**. Añadir nodos al clúster corresponde a un mecanismo de escalado de infraestructura.

## Si el resultado es distinto

| Qué observas | Qué comprobar |
| --- | --- |
| `<unknown>/50%` persiste | Ejecuta `kubectl top nodes`, `kubectl -n lab-hpa top pods` y revisa los eventos de `kubectl -n lab-hpa describe hpa web-cpu`. Comprueba que el contenedor conserva `resources.requests.cpu`. |
| La web sigue con una réplica | Mira `kubectl -n lab-hpa logs carga --tail=5`. Deberías ver el nombre de un pod web en las respuestas. Comprueba que el cliente sigue en `Running` y que la CPU de la web supera el objetivo durante varias muestras. |
| Surgen pods en `Pending` | Ejecuta `kubectl -n lab-hpa describe pod NOMBRE_DEL_POD` y lee los eventos. `Insufficient cpu` indica que falta capacidad para el nuevo pod. |
| La CPU baja y aún hay varias réplicas | Espera a que caduquen las recomendaciones previas de la ventana de estabilización y vuelve a consultar el HPA. |

## 6. Limpiar

```bash
kubectl -n lab-hpa delete pod carga --ignore-not-found
kubectl delete -f hpa.yaml
```

Si creaste `lab-hpa` exclusivamente para esta práctica y ya está vacío, puedes eliminarlo con `kubectl delete namespace lab-hpa`.

## Referencias

- [Kubernetes · Cómo funciona el escalado horizontal de pods](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/)
- [Kubernetes · Práctica oficial con HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)
- [Amazon EKS · Instalar y comprobar Metrics Server](https://docs.aws.amazon.com/eks/latest/userguide/metrics-server.html)
