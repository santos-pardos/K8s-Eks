## Commands
```
kubectl create deploy web --image=nginx --port 80 --replicas=3
kubectl get pods -l app=web
```
```
aws acm request-certificate \
--domain-name "*.us-east-1.elb.amazonaws.com" \
--key-algorithm "RSA-2048" \
--signature-algorithm "SHA256WITHRSA"
```
```
apiVersion: v1
kind: Service
metadata:
  name: lb-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: http
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: <ARN of your certificate from the aws create certicate command>
    # Only run TLS on the port named "https" below.
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "https"
spec:
  selector:
    app: web
  ports:
  - name: http
    port: 80
    targetPort: 80
  - name: https
    port: 443
    targetPort: 80
  type: LoadBalancer
```
```
kubectl apply -f loadbalancer.yaml
curl https://<your-loadbalancer-DNS> 
```
## Link
```
https://medium.com/@shivam.riky/setting-up-tls-on-a-kubernetes-loadbalancer-with-aws-eks-001649bebd8f
```

