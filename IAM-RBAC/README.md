
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

## IAM RBAC
https://www.checkmateq.com/blog/rbac-eks

https://www.infracloud.io/blogs/role-based-access-kubernetes/

## IRSA
https://repost.aws/es/knowledge-center/eks-restrict-s3-bucket

## Secrets Manager Storage CSI Driver
https://aws.amazon.com/es/blogs/security/how-to-use-aws-secrets-configuration-provider-with-kubernetes-secrets-store-csi-driver/

## IAM OIDC
https://www.padok.fr/en/blog/aws-eks-iam

## More Links
https://www.argonaut.dev/docs/guides/migrate-eks-to-gp3

https://repost.aws/es/knowledge-center/eks-restrict-s3-bucket

https://refactorizando.com/usando-serviceaccount-kubernetes/

https://medium.com/@contactjoshforthis/comprehensive-access-management-in-amazon-eks-iam-rbac-and-the-aws-auth-configmap-032a4e457bd8

https://blog.symops.com/post/access-eks-rbac-aws-iam

https://antonputra.com/kubernetes/add-iam-user-and-iam-role-to-eks/

https://marcincuber.medium.com/amazon-eks-rbac-and-iam-access-f124f1164de7

https://www.checkmateq.com/blog/rbac-eks

https://eng.grip.security/enabling-aws-iam-group-access-to-an-eks-cluster-using-rbac

https://medium.com/globant/rbac-and-eks-aws-step-by-step-e2f9c38f1aeb



