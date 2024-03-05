
## Prerequisites
```
An Amazon Elastic Compute Cloud (Amazon EC2) instance or user system with kubectl and aws-iam-authenticator binaries.
A configured kubeconfig file that points to the correct Amazon EKS cluster. For more information, see Create kubeconfig file automatically.

Deploy the Kubernetes Dashboard
To deploy the Kubernetes Dashboard on the Amazon EKS cluster, run the following command:
```
```
export DASHBOARD_VERSION="v2.7.0"
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/${DASHBOARD_VERSION}/aio/deploy/recommended.yaml
```
```
Note: Replace DASHBOARD_VERSION with the appropriate Kubernetes Dashboard release tag value.

For more information about how to deploy the Kubernetes Dashboard, see Deploying the Dashboard UI on the Kubernetes website. To check the latest available release tags, see the Kubernetes Dashboard release page on the GitHub website.
```
```
## Access the Kubernetes Dashboard UI
To access the Kubernetes Dashboard UI, complete the following steps:

Route all requests from the Amazon EC2 instance's local port to the Kubernetes Dashboard service port. Run the following command to turn on port forwarding:
```
```
kubectl port-forward svc/kubernetes-dashboard -n kubernetes-dashboard 8080:443 --address Amazon_EC2_Private_IP
```
```
Note: Replace the Amazon_EC2_Private_IP with your Amazon EC2 instance's private IP address.
Access the Kubernetes Dashboard through the following address: https://Amazon_EC2_Public_IP:8080.
When prompted, enter a token or kubeconfig file.
To get a bearer token for authentication on the Kubernetes Dashboard login page, run the following command from your local computer terminal:
```
```
aws eks get-token --cluster-name ClusterName --region Region | jq -r '.status.token'
```
```
Note: Replace the ClusterName and Region with your cluster name and AWS Region.
Copy the token from the terminal output.
In the browser's Kubernetes Dashboard login page pop-up window, choose Token. Enter the copied token into the Enter Token box.
Choose Sign in to access the Kubernetes Dashboard in your browser.
Related information
Kubernetes Dashboard on the GitHub website
```
