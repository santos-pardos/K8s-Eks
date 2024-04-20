## Install AWS Tools
```
AWS Tools (in Cloud9 you dont need to install AWS Tools) 
aws --version
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
which aws 
./aws/install --bin-dir /usr/bin --install-dir /usr/bin/aws-cli --update 
aws --version
```
## Install KUBECTL 
```
curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.28.3/2023-11-14/bin/linux/amd64/kubectl
chmod +x ./kubectl 
mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$PATH:$HOME/bin 
kubectl version --client
```
## Install EKSCTL 
```
(for ARM systems, set ARCH to: `arm64`, `armv6` or `armv7`)
```
```
ARCH=amd64
PLATFORM=$(uname -s)_$ARCH
```
```
curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"
tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp && rm eksctl_$PLATFORM.tar.gz
sudo mv /tmp/eksctl /usr/local/bin
```
```
eksctl version
```
```
eksctl get cluster
```
```
aws eks update-kubeconfig --name demo-cluster --region us-east-1
```
## Install Docker-Compose
```
sudo dnf -y install wget
```
```
sudo curl -s https://api.github.com/repos/docker/compose/releases/latest | grep browser_download_url | grep docker-compose-linux-x86_64 | cut -d '"' -f 4 | wget -qi -
```
```
sudo chmod +x docker-compose-linux-x86_64
```
```
sudo mv docker-compose-linux-x86_64 /usr/local/bin/docker-compose
```
```
docker-compose --version
```
## Install Helm
```
curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
helm version --short
```
## Links and commands
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
```

## Quick Example
```
wget https://s3.eu-west-1.amazonaws.com/www.profesantos.cloud/code/EKS-SVCs-Deployments.zip
(wget https://unir-profesantos.s3.eu-west-1.amazonaws.com/K8s-Basics-Deployments.zip)
cd Course_EKS-Basics/
cat nginx-deployment.yaml
cat nginx-svc.yaml
kubectl apply -f ./nginx-svc.yaml
kubectl get service
"xxxxxxxxx.us-east-1.elb.amazonaws.com"
curl "a06d451f9de2b4dceb100a6fflcb15c2-1122912181.us-east-1.elb.amazonaws.com"
kubectl apply -f ./nginx-deployment.yaml
kubectl get deployment
kubectl get pods
kubectl get rs
kubectl get node
kubectl get service
kubectl get replicaset
kubectl get node
kubectl get namespaces
kubectl get all --all-namespaces
kubectl get pod
kubectl -n kube-system get all
kubectl -n kube-system get pods
kubectl run nginx --image=nginx
kubectl port-forward my-service 8000:80
kubectl exec -it tetris-86cd7c55c7-8mwtd -- /bin/bash
kubectl exec -ti worker-hello-5bfdf775d7-46f2g sh
aws eks list-clusters
aws eks describe-cluster --name
kubectl cluster-info
kubectl scale deployment ecsdemo-nodejs --replicas=3
kubectl scale deployment ecsdemo-crystal --replicas=3
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl config set-context --current --namespace=default
kubectl get pods --all-namespaces
kubectl delete pod two-containers
kubectl delete deployment two-containers
eksctl delete cluster dev-cluster
Logs
kubectl describe pod xxxxxxx
docker inspect santospardos/sanvalero:azuresql
kubectl logs -f deploy/mssql-sample-deployment
kubectl exec -it pod/mssql-deployment-7f55b56bc9-l5gn9 /bin/bash
```
## Links
```
https://www.bluematador.com/learn/kubectl-cheatsheet
```
## Tools
```
docker run --name cloudbeaver --rm -ti -d -p 8080:8978 -v /opt/cloudbeaver/workspace dbeaver/cloudbeaver:latest
docker run -it  nicolaka/netshoot sh
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot
https://github.com/nicolaka/netshoot
kubectl get pod -o wide
kubectl run -i --tty --rm debug --image=busybox --restart=Never -- sh
kubectl run -i --tty --rm debug --image=nicolaka/netshoot --restart=Never -- sh
nc -vz mysql-service 3306 (mysql-service external RDS)
(https://dev.to/bensooraj/accessing-amazon-rds-from-aws-eks-2pc3)
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql
```
## Microservices Example
```
https://unir-profesantos.s3.eu-west-1.amazonaws.com/EKS-Microservices.zip
```
## Error loggin server in AWS Academy
```
Edit the file: $ cat ~/.aws/credentials
Remove the token and the region lines (left only these)
[default]
aws_access_key_id = AKIA2HW7LBNS5
aws_secret_access_key = 9phAAEUyPr1mmlZTqjiWBpu5ynkp3b
```
