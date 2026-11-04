kubectl get configmaps

kubectl describe cm rds-config

kubectl get cm rds-config -o yaml



kubectl get secrets

kubectl describe secret rds-credentials

kubectl get secret rds-credentials -o yaml

kubectl get secret rds-credentials -o jsonpath="{.data.username}" | base64 --decode
