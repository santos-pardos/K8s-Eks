## Practical Kubernetes. Deploy User Management Microservice
```
kubectl apply -f namespace.yaml
kubectl apply -f storage.yaml
kubectl apply -f pvc.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f mysql-service.yaml
kubectl apply -f api-deployment.yaml
kubectl apply -f api-service.yaml
```
```
http://public-ip-node-service:32396/usermgmt/health-status
curl -X POST -H 'Content-Type: application/json' -d @body.json http://public-ip-node-service:31231/usermgmt/user
http://public-ip-node-service:32396/usermgmt/users 
```
## Links
```
https://blog.devgenius.io/practical-kubernetes-deploy-user-management-microservice-604f16fe2b2b
https://brightdata.com/blog/how-tos/curl-post-request-guide
```
