## Link
```
https://amod-kadam.medium.com/setting-up-nginx-ingress-controller-with-eks-f27390bcf804
https://github.com/AliyunContainerService/serverless-k8s-examples/tree/master/ingress-nginx
https://aws.amazon.com/es/blogs/containers/exposing-kubernetes-applications-part-3-nginx-ingress-controller/
https://www.youtube.com/watch?v=gvKi7wZHbLU
https://kubernetes.github.io/ingress-nginx/deploy/
https://blog.saeloun.com/2023/03/21/setup-nginx-ingress-aws-eks/
https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes
https://jvlewis.dev/how-to-expose-multiple-kubernetes-eks-services-using-a-single-aws-application-load-balancer-9412daaf426c
```

## Install SSL, Helm, Ingress Controller
```
sudo yum install openssl
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 > get_helm.sh 
chmod 700 get_helm.sh 
./get_helm.sh
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --namespace ingress-nginx --create-namespace
```
```
kubectl apply -f cafe-secret.yml -n ingress-nginx
kubectl apply -f cafe.yml -n ingress-nginx
kubectl apply -f cafe-ingress.yml -n ingress-nginx
```
```
kubectl -n ingress-nginx get svc|grep nginx
change the alb in route53    cafe.retocsv.es
http://cafe.retocsv.es
http://cafe.retocsv.es/tea

```

```
# create deployment
kubectl create deployment demo  --image=httpd  --port=80 
# expose deployment as a service
kubectl expose deployment demo
kubectl create ingress demo --class=nginx --rule www.demo.io/=demo:80
curl — resolve www.demo.io:80:3.108.142.158 http://www.demo.io
# uninstall ingress controller
helm uninstall ingress-nginx -n ingress-nginx
# install ingress controller with NLB
helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx  --namespace ingress-nginx --create-namespace \
  --set-string controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"
```

### Install Uninstall Nginx-Controller
```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm upgrade -i ingress-nginx ingress-nginx/ingress-nginx \
    --version 4.2.3 \
    --namespace kube-system \
    --set controller.service.type=ClusterIP
kubectl -n kube-system rollout status deployment ingress-nginx-controller
kubectl get deployment -n kube-system ingress-nginx-controller
```

```
helm uninstall -n kube-system ingress-nginx
helm uninstall -n kube-system aws-load-balancer-controller
```

