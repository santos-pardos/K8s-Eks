## Google Link and yaml files
```
https://kubernetes.io/docs/tutorials/stateless-application/guestbook/
```
```
kubectl apply -f https://k8s.io/examples/application/guestbook/redis-leader-deployment.yaml
kubectl apply -f https://k8s.io/examples/application/guestbook/redis-leader-service.yaml
kubectl apply -f https://k8s.io/examples/application/guestbook/redis-follower-deployment.yaml
kubectl apply -f https://k8s.io/examples/application/guestbook/redis-follower-service.yaml
kubectl apply -f https://k8s.io/examples/application/guestbook/frontend-deployment.yaml
kubectl apply -f https://k8s.io/examples/application/guestbook/frontend-service.yaml
```
# Link

https://kubernetes.io/docs/tutorials/stateless-application/guestbook/

https://github.com/kubernetes/examples


kubectl apply -f readis-leader-deployment.yaml

kubectl get pods

kubectl logs -f deployment/redis-leader

kubectl apply -f readis-leader-svc.yaml

kubectl get service

kubectl apply -f readis-follower-deployment.yaml

kubectl get pods

kubectl apply -f readis-follower-svc.yaml

kubectl get service

kubectl apply -f frontend-deployment.yaml

kubectl get pods -l app=guestbook -l tier=frontend

kubectl apply -f frontend-svc.yaml

kubectl get services

(this sentences if the frontend-svc.yaml comment the type: Load balancer)
kubectl port-forward svc/frontend 8080:80

kubectl get service frontend

kubectl scale deployment frontend --replicas=5

kubectl get pods

kubectl scale deployment frontend --replicas=2

kubectl get pods

CLEAN UP

kubectl delete deployment -l app=redis

kubectl delete service -l app=redis

kubectl delete deployment frontend

kubectl delete service frontend
