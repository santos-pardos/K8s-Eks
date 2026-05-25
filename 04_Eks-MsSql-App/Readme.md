## Links
https://rajanieshkaushikk.com/2021/02/27/how-to-deploy-sql-server-containers-to-a-kubernetes-cluster-for-high-availability/


## EKS Secret
kubectl create secret generic mssql-secret --from-literal=SA_PASSWORD="example_123"


## Secrets
echo -n "example_123" | base64                                                                                                                           
ZXhhbXBsZV8xMjM=

## Netshoot
kubectl get pods -l app=mssql -o wide
kubectl run netshoot --rm -i --tty --image nicolaka/netshoot -- /bin/bash
nc -zv 10.244.1.45 1433

kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot

## DBBeaver
docker run -d --name cloudbeaver --rm -ti -p 80:8978 -v /opt/cloudbeaver/workspace dbeaver/cloudbeaver:latest
