
## emptyDir
```
kubectl create -f nginx-emptydir.yaml
kubectl get po -o wide
kubectl exec nginx-emptydir df /test-mnt
kubectl describe pod nginx-emptydir
kubectl delete po nginx-emptydir
```
## hostPath
```
kubectl create -f nginx-hostpath.yaml
kubectl get po
kubectl exec nginx-hostpath df /test-mnt
From HOST:
cd /test-vol
echo "From Host" > from-host.txt
cat from-host.txt
From POD:
kubectl exec nginx-hostpath cat /test-mnt/from-host.txt

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
kubectl exec -it busybox  touch /mydata/test.txt
kubectl create -f pv-policy-delete.yaml
kubectl create -f pvc-policy-delete.yaml
kubectl create -f pod-policy-delete.yaml
kubectl exec -it busybox  touch /mydata/test.txt
```

## Link
https://www.devopsworld.co.in/p/kubernetes-volumes-emptydirhostpath.html
https://loft.sh/blog/kubernetes-persistent-volumes-examples-and-best-practices/
https://medium.com/@dipali26N/day-28-kubernetes-volumes-creating-emptydir-volume-and-hostpath-types-603cb501dd21
https://www.devopsworld.co.in/p/kubernetes-tutorials.html
