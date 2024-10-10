variable "name" {
  description = "Name of the Kubernetes deployment and service"
  type        = string
}

variable "namespace" {
  description = "Namespace for the Kubernetes resources"
  type        = string
}

variable "labels" {
  description = "Labels to apply to the Kubernetes resources"
  type        = map(string)
}

variable "replicas" {
  description = "Number of replicas for the deployment"
  type        = number
}

variable "image" {
  description = "Docker image for the container"
  type        = string
}

variable "port" {
  description = "Port for the container and service"
  type        = number
}

variable "config_map_name" {
  description = "Name of the ConfigMap to use for environment variables"
  type        = string
}

variable "secret_name" {
  description = "Name of the Secret to use for environment variables"
  type        = string
  default     = null
}

variable "resource_limits" {
  description = "Resource limits for the container"
  type        = map(string)
}

variable "resource_requests" {
  description = "Resource requests for the container"
  type        = map(string)
}

variable "service_type" {
  description = "Type of the Kubernetes service (e.g., ClusterIP, NodePort, LoadBalancer)"
  type        = string
  default     = "ClusterIP"
}