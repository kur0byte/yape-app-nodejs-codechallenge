# # variables.tf

# variable "namespace" {
#   description = "The Kubernetes namespace to deploy the Yape Financial System"
#   type        = string
#   default     = "yape-financial-system"
# }

# variable "environment" {
#   description = "Deployment environment"
#   type        = string
#   default     = "development"
# }

# variable "docker_registry" {
#   description = "Docker registry for Yape services"
#   type        = string
#   default     = "kur0dev"
# }

# variable "image_versions" {
#   description = "Docker image versions for each service"
#   type        = map(string)
#   default     = {
#     postgres    = "14"
#     zookeeper   = "7.3.0"
#     kafka       = "7.3.0"
#     api_gateway = "latest"
#     transaction = "latest"
#     anti_fraud  = "latest"
#     status      = "latest"
#   }
# }

# variable "replicas" {
#   description = "Number of replicas for each service"
#   type        = map(number)
#   default     = {
#     api_gateway = 1
#     transaction = 1
#     anti_fraud  = 1
#     status      = 1
#     postgres    = 1
#     zookeeper   = 1
#     kafka       = 1
#   }
# }

# variable "resource_limits" {
#   description = "Resource limits for each service"
#   type = map(object({
#     cpu    = string
#     memory = string
#   }))
#   default = {
#     api_gateway = { cpu = "0.5", memory = "512Mi" }
#     transaction = { cpu = "0.5", memory = "512Mi" }
#     anti_fraud  = { cpu = "0.5", memory = "512Mi" }
#     status      = { cpu = "0.5", memory = "512Mi" }
#     postgres    = { cpu = "1",   memory = "1Gi" }
#     zookeeper   = { cpu = "0.5", memory = "512Mi" }
#     kafka       = { cpu = "1",   memory = "1Gi" }
#   }
# }

# variable "resource_requests" {
#   description = "Resource requests for each service"
#   type = map(object({
#     cpu    = string
#     memory = string
#   }))
#   default = {
#     api_gateway = { cpu = "250m", memory = "256Mi" }
#     transaction = { cpu = "250m", memory = "256Mi" }
#     anti_fraud  = { cpu = "250m", memory = "256Mi" }
#     status      = { cpu = "250m", memory = "256Mi" }
#     postgres    = { cpu = "500m", memory = "512Mi" }
#     zookeeper   = { cpu = "250m", memory = "256Mi" }
#     kafka       = { cpu = "500m", memory = "512Mi" }
#   }
# }

# # Database variables
# variable "db_name" {
#   description = "Name of the database"
#   type        = string
#   default     = "financial_system"
# }

# variable "db_username" {
#   description = "Username for the database"
#   type        = string
#   default     = "admin"
#   sensitive   = true
# }

# variable "db_password" {
#   description = "Password for the database"
#   type        = string
#   default     = "adminPassword"
#   sensitive   = true
# }

# variable "db_port" {
#   description = "Port for the database"
#   type        = number
#   default     = 5432
# }

# # Kafka variables
# variable "kafka_broker_port" {
#   description = "Port for Kafka broker"
#   type        = number
#   default     = 9092
# }

# # Zookeeper variables
# variable "zookeeper_client_port" {
#   description = "Client port for Zookeeper"
#   type        = number
#   default     = 2181
# }

# # API Gateway variables
# variable "api_gateway_port" {
#   description = "Port for the API Gateway"
#   type        = number
#   default     = 3000
# }

# # Service ports
# variable "service_ports" {
#   description = "Ports for each service"
#   type        = map(number)
#   default     = {
#     transaction = 3001
#     anti_fraud  = 3002
#     status      = 3003
#   }
# }

# # ConfigMap data
# variable "config_map_data" {
#   description = "Data to be included in the ConfigMap"
#   type        = map(string)
#   default     = {
#     DB_HOST      = "postgres-service"
#     DB_PORT      = "5432"
#     DB_NAME      = "financial_system"
#     KAFKA_BROKER = "kafka-service:9092"
#   }
# }

# # Labels
# variable "common_labels" {
#   description = "Common labels to be applied to all resources"
#   type        = map(string)
#   default     = {
#     project     = "yape-financial-system"
#     environment = "development"
#   }
# }

# variable "paths" {
#     description = "Paths to the different modules"
#     type        = map(string)
#     default     = {
#         database     = "./modules/database"
#         kafka        = "./modules/kafka"
#         service      = "./modules/service-module"
#         config_secrets = "./modules/config-and-secrets"
#     }
# }

# variable "metallb_address_pool" {
#   type        = list(string)
#   description = "IP address range for MetalLB to use for load balancer services"
#   default     = ["192.168.49.100-192.168.49.200"]
# }