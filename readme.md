# Install AWS Tools
```
AWS Tools (in Cloud9 you dont need to install AWS Tools) 
aws --version
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
which aws 
./aws/install --bin-dir /usr/bin --install-dir /usr/bin/aws-cli --update 
aws --version
```
# Install KUBECTL 
```
curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.28.3/2023-11-14/bin/linux/amd64/kubectl
chmod +x ./kubectl 
mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$PATH:$HOME/bin 
kubectl version --client
```
# Install EKSCTL 
```
ARCH=amd64
(for ARM systems, set ARCH to: `arm64`, `armv6` or `armv7`)
PLATFORM=$(uname -s)_$ARCH
curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"
tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp && rm eksctl_$PLATFORM.tar.gz
sudo mv /tmp/eksctl /usr/local/bin
eksctl version 
eksctl help
eksctl get cluster
aws eks update-kubeconfig --name demo-cluster --region us-east-1
```

# Links and commands
```
https://github.com/stacksimplify/kubernetes-fundamentals/tree/master/02-PODs-with-kubectl
https://www.stacksimplify.com/aws-eks/kubernetes-for-absolute-beginners/kubernetes-for-absolute-beginners/
```
```
AWS Doc
https://docs.aws.amazon.com/eks/latest/userguide/sample-deployment.html
```
```
kubectl get --all-namespaces pods
kubectl get pods
kubectl get deployments
kubectl run my-first-pod --image stacksimplify/kubenginx:1.0.0
kubectl expose pod my-first-pod  --type=NodePort --port=80 --name=my-first-service
kubectl expose pod my-first-pod  --type=NodePort --port=80 --target-port=80 --name=my-first-service3
kubectl port-forward my-first-pod 8080:80
kubectl get pods -o wide
kubectl get service
kubectl get svc
kubectl get nodes -o wide
kubectl describe pod my-first-pod 
kubectl logs my-first-pod
kubectl exec -it my-first-pod -- /bin/bash
  ls
  cd /usr/share/nginx/html
  cat index.html
  exit 
kubectl exec -it my-first-pod ls
kubectl run nginx2 --image=nginx --requests=cpu=500m --expose --port=80
kubectl run YOUR_DEPLOYMENT_NAME --image=YOUR_IMAGE_URL --requests=cpu=500m --expose --port=YOUR_SERVICE_PORT
kubectl describe pods nginx2
kubectl exec -it nginx2 /bin/bash
kubectl create deployment nginx-deploy --image nginx
kubectl get deployments
kubectl get pods
kubectl describe deployment nginx-deploy
kubectl logs deployment/nginx-deploy
kubectl run -i --tty busybox --image=busybox --restart=Never -- sh
kubectl run -i --rm --tty debug --image=busybox -- sh
kubectl run -i --tty utils --image=arunvelsriram/utils --restart=Never -- sh
sudo amazon-linux-extras install epel -y
sudo yum install stress -y


