## Links
```
https://kubernetes.io/es/docs/concepts/workloads/controllers/jobs-run-to-completion/
https://howtoforge.es/trabajos-en-kubernetes/
https://loft.sh/blog/kubernetes-statefulset-examples-and-best-practices/
https://github.com/iesgn/curso_kubernetes_cep/blob/main/modulo9/jobs.md
https://github.com/iesgn/curso_kubernetes_cep/blob/main/modulo9/statefulsets.md
https://github.com/collabnix/kubelabs/tree/master/Jobs101
https://crontab.guru/#*_/1_*_*_*
```

## Commands
```
kubectl apply -f https://k8s.io/examples/controllers/job.yaml
kubectl describe jobs/pi
pods=$(kubectl get pods --selector=job-name=pi --output=jsonpath='{.items[*].metadata.name}')
echo $pods
kubectl logs $pods
```
