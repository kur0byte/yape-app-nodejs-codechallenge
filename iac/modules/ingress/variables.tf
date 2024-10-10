
variable "name" {
  type = string
  description = "Name of the Ingress resource"
}

variable "namespace" {
  type = string
  description = "Namespace to deploy the Ingress resource"
}

variable "paths" {
  description = "List of paths for the ingress"
  type = list(object({
    path          = string
    service_name  = string
    service_port  = number
  }))
}