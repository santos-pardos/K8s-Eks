## DaemontSet
```
kubectl apply -f daemontset-fluent.yaml
kubectl describe daemonset fluentd
kubectl get pods -l app=fluentd -o wide
kubectl label nodes xxxxAWSNODEXXX ssd="true"
kubectl get nodes --selector ssd="true"
kubectldescribe node xxxxAWSNODEZZZZ
kubectl delete daemonset fluentd
kubectl apply -f daemontset-fluent-ssd.yaml
kubectl get pods -l app=fluentd -o wide
kubectl apply -f daemontset-fluent-rolling.yaml
kubectl rollout status ds/fluentd
```
```
https://imaginaformacion.com/tutoriales/guia-completa-de-daemonset-en-kubernetes
```

## Configmaps
kubectl create cm mariadb --from-literal=root_password=my-password --from-literal=mysql_usuario=usuario --from-literal=mysql_password=password-user --from-literal=basededatos=test

## Secrets

kubectl create secret generic secretname --from-literal=username1=dXNlcm5hbWU= --from-literal=password1=cGFzc3dvcmQ=
kubectl create -f <filename.yaml>

kubectl get secret  # To verify the secretes

# Consuming Secret Values from environment variables
kubectl create -f <filename.yaml>
kubectl exec -it <podname> -- sh
env | grep <envfilename>

#  Consuming Secret values from volumes.
kubectl create -f <volumefilename.yaml>
kubectl exec -it <podname> -- sh

# Links
```
https://howtoforge.es/trabajos-en-kubernetes/
https://loft.sh/blog/kubernetes-statefulset-examples-and-best-practices/
https://github.com/iesgn/curso_kubernetes_cep/blob/main/modulo9/jobs.md
https://github.com/iesgn/curso_kubernetes_cep/blob/main/modulo9/statefulsets.md
https://github.com/collabnix/kubelabs/tree/master/Jobs101
```
