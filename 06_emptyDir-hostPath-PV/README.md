
## emptyDir
```
kubectl create -f nginx-emptydir.yaml
kubectl get po -o wide
kubectl exec -it nginx-emptydir -- sh
df /test-mnt
kubectl describe pod nginx-emptydir
kubectl delete po nginx-emptydir
```
## hostPath
```
kubectl create -f nginx-hostpath.yaml
kubectl get po
kubectl exec nginx-hostpath df /test-mnt
kubectl exec -it nginx-hostpath -- sh
kubectl get all -o wide

From HOST:
cd /test-vol
echo "From Host" > from-host.txt
cat from-host.txt
touch demo.txt
ls /test-vol

From POD:
kubectl exec nginx-hostpath cat /test-mnt/from-host.txt
kubectl exec nginx-hostpath ls /test-mnt

From POD:
kubectl exec nginx-hostpath -it -- /bin/sh
cd /test-mnt
echo "From Pod" > from-pod.txt
cat from-pod.txt

From Host:
cd /test-vol
ls
cat from-pod.txt


kubectl delete po nginx-hostpath
kubectl get po
ls /test-vol
```

## PV - PVC
```
kubectl create -f pv.yaml
kubectl create -f pvc.yaml
kubectl create -f pod.yaml
kubectl exec -it busybox  -- /bin/sh
touch /mydata/test.txt
kubectl delete -f pod.yaml
kubectl apply -f pod.yaml
kubectl exec -it busybox  -- /bin/sh
ls -la /mydata

```

## Link
https://www.devopsworld.co.in/p/kubernetes-volumes-emptydirhostpath.html
https://loft.sh/blog/kubernetes-persistent-volumes-examples-and-best-practices/
https://medium.com/@dipali26N/day-28-kubernetes-volumes-creating-emptydir-volume-and-hostpath-types-603cb501dd21
https://www.devopsworld.co.in/p/kubernetes-tutorials.html
https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/
https://docs.openshift.com/container-platform/4.8/storage/persistent_storage/persistent-storage-hostpath.html
https://k21academy.com/docker-kubernetes/kubernetes-persistent-storage-pv-pvc-and-storage-class/

## AWS EBS Link
https://docs.aws.amazon.com/es_es/eks/latest/userguide/ebs-sample-app.html


