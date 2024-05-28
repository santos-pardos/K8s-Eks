## Replicaset
```
kubectl apply -f nginx-rs.yaml
kubectl get rs,pods
kubectl describe rs replicaset-nginx
kubectl delete pod <nombre_del_pod>
kubectl get pods
kubectl scale rs replicaset-nginx --replicas=5
kubectl get pods
kubectl apply -f nginx-rs.yaml
kubectl scale rs replicaset-nginx --replicas=1
kubectl delete rs replicaset-nginx
kubectl delete -f nginx-rs.yaml
```
## Links
```
https://github.com/iesgn/curso_kubernetes_cep/blob/main/modulo4/describiendo_replicaset.md
```

https://kubernetes.io/es/docs/concepts/workloads/controllers/replicaset/

https://kubernetes.io/es/docs/concepts/workloads/controllers/daemonset/

https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/

https://www.airplane.dev/blog/kubectl-scale

https://www.airplane.dev/blog/kubectl-port-forward

https://medium.com/techlogs/kubernetes-different-ways-of-exposing-a-service-by-an-example-b81646d20cba

https://imaginaformacion.com/tutoriales/guia-completa-de-daemonset-en-kubernetes


EKS Courses

https://www.devopsschool.com/blog/explained-kubernetes-daemonset-with-example/

https://www.stacksimplify.com/aws-eks/
