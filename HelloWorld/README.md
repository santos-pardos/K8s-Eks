# Extra Links

https://joachim8675309.medium.com/building-eks-with-eksctl-799eeb3b0efd
https://github.com/darkn3rd/blog_tutorials/tree/master/kubernetes/eks_1_provision_eksctl

HPA
```
https://www.kubecost.com/kubernetes-autoscaling/kubernetes-hpa/
```
```
kubectl autoscale deployment hello-kubernetes  --cpu-percent=50 --min=3 --max=10
kubectl get hpa
kubectl delete hpa hello-kubernetes
```

image: paulbouwer/hello-kubernetes:1.5

image: santospardos/sanvalero:hello-k8s

image: santospardos/unir:hello-k8s
