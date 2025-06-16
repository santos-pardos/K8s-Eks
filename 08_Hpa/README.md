## Commands
```
kubectl apply -f deployment.yaml
kubectl apply -f hpa.yaml
```
```
kubectl get hpa web-hpa -w        # refresco continuo
kubectl get pods -l app=web -w    # verás crearse/eliminarse pods
```

```
## Comprobar/instalar Metrics Server 
# Verifica que el APIService esté sano
kubectl get apiservices | grep metrics
# Si no aparece o el estado NO es "True", instálalo:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

## Desplegar la carga que quema CPU
kubectl apply -f deployment.yaml
kubectl get pods -l app=web

## Crear el Horizontal Pod Autoscaler
kubectl apply -f hpa.yaml
kubectl get hpa hpa

## Observar en tiempo real cómo escala
# Terminal A – estado del HPA
kubectl get hpa web-hpa -w

# Terminal B – lista de pods
kubectl get pods -l app=web -w

## Comprobar métricas y detalles (opcional)
# Uso de CPU en tiempo real ( requiere metrics-server )
kubectl top pods -l app=web

# Diagnóstico completo del HPA
kubectl describe hpa web-hpa
```

## Links
https://medium.com/@kanishks772/the-hidden-cost-of-idle-servers-how-to-auto-scale-smarter-not-harder-e6d6298ac9d2
https://github.com/rahulsahay19?tab=repositories
