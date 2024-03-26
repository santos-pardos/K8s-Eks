## Link
https://amod-kadam.medium.com/setting-up-nginx-ingress-controller-with-eks-f27390bcf804


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
# create deployment
kubectl create deployment demo  --image=httpd  --port=80 
# expose deployment as a service
kubectl expose deployment demo
kubectl create ingress demo --class=nginx --rule www.demo.io/=demo:80
curl — resolve www.demo.io:80:3.108.142.158 http://www.demo.io
# uninstall ingress controller
helm uninstall ingress-nginx -n ingress-ngins
# install ingress controller with NLB
helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx  --namespace ingress-nginx --create-namespace \
  --set-string controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"
```