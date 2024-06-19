
## IAM User and RBAC K8s

 Create IAM User: eks-developer with access key and secret access key (no permissions)

 kubectl apply -f role.yaml

 kubectl apply -f rolebinding.yaml

 kubectl edit configmap aws-auth -n kube-system

 (add the mapusers)
 ```
   mapUsers: |
    - userarn: arn:aws:iam::237984217794:user/eks-developer
      username: eks-developer
  ```

```
-----------
data:
  mapRoles: |
    - groups:
      - system:bootstrappers
      - system:nodes
      rolearn: arn:aws:iam::237984217794:role/EKS-Node-SV
      username: system:node:{{EC2PrivateDNSName}}
    - groups:
      - system:bootstrappers
      - system:nodes
      - system:node-proxier
      rolearn: arn:aws:iam::237984217794:role/EKS-Fargate
      username: system:node:{{SessionName}}
  mapUsers: |
    - userarn: arn:aws:iam::237984217794:user/eks-developer
      username: eks-developer
kind: ConfigMap
----------
```

kubectl get pods --as eks-developer

kubectl delete  pods hello-kubernetes-75ff9bb448-hghjn --as eks-developer  

## Links
https://www.checkmateq.com/blog/rbac-eks

https://repost.aws/es/knowledge-center/eks-restrict-s3-bucket

https://www.infracloud.io/blogs/role-based-access-kubernetes/

