## Links
```
https://rajanieshkaushikk.com/2021/02/27/how-to-deploy-sql-server-containers-to-a-kubernetes-cluster-for-high-availability/
```

## EKS Secret
```
kubectl create secret generic mssql-secret --from-literal=SA_PASSWORD="example_123"
```

## Secrets
```
echo -n "example_123" | base64                                                                                                                           
ZXhhbXBsZV8xMjM=
```
## Netshoot
```
kubectl get pods -l app=mssql -o wide
```
```
kubectl run netshoot --rm -i --tty --image nicolaka/netshoot -- /bin/bash
```
```
nc -zv 10.244.1.45 1433
```
```
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot
```

## DBBeaver
```
kubectl run cloudbeaver --image=dbeaver/cloudbeaver:latest -n default --port=8978 --expose --overrides='{"spec": {"ports": [{"port": 80, "targetPort": 8978}]}}'
```
```
kubectl port-forward pod/cloudbeaver 8080:8978 -n default --address 0.0.0.0
```
```
mssql-service.default.svc.cluster.local
mssql-service
```
