# index.tf (or main.tf)

terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.32"
    }
  }
}
 
provider "kubernetes" {
  config_path    = "~/.kube/config"
}

# Create namespace
resource "kubernetes_namespace" "yape" {
  metadata {
    name   = var.namespace
    labels = var.common_labels
  }
}

# ConfigMap and Secrets
module "config_and_secrets" {
  source      = "./modules/config-and-secrets"
  namespace   = kubernetes_namespace.yape.metadata[0].name
  config_data = var.config_map_data
  db_username = var.db_username
  db_password = var.db_password
}

# Database
module "database" {
  source            = "./modules/database"
  namespace         = kubernetes_namespace.yape.metadata[0].name
  image_version     = var.image_versions.postgres
  replicas          = var.replicas.postgres
  resource_limits   = var.resource_limits.postgres
  resource_requests = var.resource_requests.postgres
  db_name           = var.db_name
  db_port           = var.db_port
  config_map_name   = module.config_and_secrets.config_map_name
  secret_name       = module.config_and_secrets.secret_name
  labels            = var.common_labels
}

# Kafka and Zookeeper
module "kafka" {
  source             = "./modules/kafka"
  namespace          = kubernetes_namespace.yape.metadata[0].name
  kafka_version      = var.image_versions.kafka
  zookeeper_version  = var.image_versions.zookeeper
  kafka_replicas     = var.replicas.kafka
  zookeeper_replicas = var.replicas.zookeeper
  kafka_port         = var.kafka_broker_port
  zookeeper_port     = var.zookeeper_client_port
  resource_limits    = {
    kafka     = var.resource_limits.kafka
    zookeeper = var.resource_limits.zookeeper
  }
  resource_requests  = {
    kafka     = var.resource_requests.kafka
    zookeeper = var.resource_requests.zookeeper
  }
  labels             = var.common_labels
}

# API Gateway
module "api_gateway" {
  source            = "./modules/service-module"
  name              = "api-gateway"
  namespace         = kubernetes_namespace.yape.metadata[0].name
  image             = "${var.docker_registry}/yape-api-gateway:${var.image_versions.api_gateway}"
  replicas          = var.replicas.api_gateway
  port              = var.api_gateway_port
  resource_limits   = var.resource_limits.api_gateway
  resource_requests = var.resource_requests.api_gateway
  config_map_name   = module.config_and_secrets.config_map_name
  labels            = var.common_labels
  service_type = "LoadBalancer"
  depends_on = [module.metallb]
}

# Transaction Service
module "transaction_service" {
  source            = "./modules/service-module"
  name              = "transaction-service"
  namespace         = kubernetes_namespace.yape.metadata[0].name
  image             = "${var.docker_registry}/yape-transaction-service:${var.image_versions.transaction}"
  replicas          = var.replicas.transaction
  port              = var.service_ports.transaction
  resource_limits   = var.resource_limits.transaction
  resource_requests = var.resource_requests.transaction
  config_map_name   = module.config_and_secrets.config_map_name
  secret_name       = module.config_and_secrets.secret_name
  labels            = var.common_labels
  service_type = "LoadBalancer"
  depends_on = [module.metallb]
}

# Anti-Fraud Service
module "anti_fraud_service" {
  source            = "./modules/service-module"
  name              = "anti-fraud-service"
  namespace         = kubernetes_namespace.yape.metadata[0].name
  image             = "${var.docker_registry}/yape-anti-fraud-service:${var.image_versions.anti_fraud}"
  replicas          = var.replicas.anti_fraud
  port              = var.service_ports.anti_fraud
  resource_limits   = var.resource_limits.anti_fraud
  resource_requests = var.resource_requests.anti_fraud
  config_map_name   = module.config_and_secrets.config_map_name
  labels            = var.common_labels
  service_type = "LoadBalancer"
  depends_on = [module.metallb]
}

# Status Update Service
module "status_update_service" {
  source            = "./modules/service-module"
  name              = "status-update-service"
  namespace         = kubernetes_namespace.yape.metadata[0].name
  image             = "${var.docker_registry}/yape-status-update-service:${var.image_versions.status}"
  replicas          = var.replicas.status
  port              = var.service_ports.status
  resource_limits   = var.resource_limits.status
  resource_requests = var.resource_requests.status
  config_map_name   = module.config_and_secrets.config_map_name
  secret_name       = module.config_and_secrets.secret_name
  labels            = var.common_labels
  service_type = "LoadBalancer"
  depends_on = [module.metallb]
}

module "ingress" {
  source = "./modules/ingress"
  name      = "my-ingress"
  namespace = kubernetes_namespace.yape.metadata[0].name
  paths = [
    {
      path          = "/api"
      service_name  = "api-gateway"
      service_port  = 3000
    },
    {
      path          = "/transaction"
      service_name  = "transaction-service"
      service_port  = 3001
    },
    {
      path          = "/anti-fraud"
      service_name  = "anti-fraud-service"
      service_port  = 3002
    },
    {
      path          = "/status-update"
      service_name  = "status-update-service"
      service_port  = 3003
    }
  ]
}

module "metallb" {
  source      = "./modules/metallb"
  address_pool = var.metallb_address_pool
}