## Kubectl
```
kubectl get pods -o wide
```
```
kubectl get pods
kubectl get pvc
kubectl exec -it mysql-clase-0 -- sh
kubectl exec -it  mysql-clase-0 bin/bash
kubectl delete pod mysql-clase-0
kubectl get pods -w
kubectl exec -it mysql-clase-0 -- cat /var/lib/mysql/nota_clase.txt
kubectl scale statefulset mysql-clase --replicas=2                          error porque no hay mas PV solo hay uno y asociado al primer pod
```
## Analaogía
1. DaemonSet: "Uno en cada servidor, siempre"

Un DaemonSet se asegura de que haya exactamente una copia de tu aplicación ejecutándose en todos los servidores (Nodos) de tu clúster de Kubernetes.

Si añades un nuevo servidor al clúster, el DaemonSet automáticamente pondrá una copia de tu aplicación en ese nuevo servidor. Si quitas el servidor, esa copia se elimina de forma segura.

    La analogía: Imagina que tienes una cadena de tiendas (el clúster) y cada tienda es un edificio físico (un Nodo). Un DaemonSet es como la regla de que cada tienda debe tener exactamente un guardia de seguridad. Si abres una nueva sucursal, automáticamente contratas a un guardia para ella. Nunca tendrás una tienda con cero guardias, ni una tienda con cinco guardias.

    Ejemplo sencillo de uso: * Recolectores de logs (registros): Quieres que un pequeño programa recoja los errores de cada servidor para enviarlos a una base de datos central.

        Monitorización: Un agente que revisa cuánta memoria y CPU está gastando cada servidor individualmente.

2. StatefulSet: "Identidad y orden estricto"

Un StatefulSet se usa para aplicaciones que necesitan "recordar" quiénes son y qué datos tienen (aplicaciones con estado o stateful).

A diferencia de los Pods normales (que son como clones anónimos y desechables), los Pods en un StatefulSet tienen una identidad única y persistente (ej. Pod-0, Pod-1, Pod-2). Si el "Pod-1" se rompe, Kubernetes crea un nuevo "Pod-1" para reemplazarlo, el cual se reconecta exactamente al mismo disco duro de almacenamiento que tenía el original. Además, se encienden y apagan en orden estricto.

    La analogía: Imagina un equipo de fútbol profesional. Los jugadores no son clones anónimos; cada uno tiene su número de camiseta, su posición específica y su propia taquilla en el vestuario con sus cosas personales. Si el "Jugador número 10" se lesiona (el Pod falla), el suplente que entra asume el rol del número 10, juega en esa misma posición y usa la misma taquilla (su disco duro).

    Ejemplo sencillo de uso: * Bases de datos (MySQL, MongoDB, Cassandra): Necesitas que la base de datos sepa exactamente quién es el servidor "Maestro" (Pod-0) y quiénes son los "Esclavos/Réplicas" (Pod-1, Pod-2). Si un esclavo se reinicia, no puede perder su disco duro, debe seguir siendo el mismo esclavo con los mismos datos.

Resumen en una tabla
Característica	DaemonSet	StatefulSet
¿Cuál es su objetivo principal?	Estar presente en todos (o casi todos) los Nodos.	Mantener la identidad y los datos de cada Pod a salvo.
¿Tienen identidad única los Pods?	No, son clones idénticos.	Sí (Nombre-0, Nombre-1, etc.).
¿Qué pasa si falla un Pod?	Se crea otro clon anónimo en ese servidor.	Se recrea con el mismo nombre exacto y se reconecta a su mismo disco.
¿Para qué se usa?	Antivirus, monitorización, recolección de logs.	Bases de datos, sistemas de colas de mensajes (Kafka).
