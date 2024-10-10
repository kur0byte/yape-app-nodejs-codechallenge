output "service_name" {
  description = "Name of the Kubernetes service"
  value       = kubernetes_service.service.metadata[0].name
}

output "deployment_name" {
  description = "Name of the Kubernetes deployment"
  value       = kubernetes_deployment.service.metadata[0].name
}