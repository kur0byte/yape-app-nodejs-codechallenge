# main.tf

terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    # minikube = {
    #   source = "scott-the-programmer/minikube"
    #   version = "0.3.3"
    # }
  }
}

# provider "minikube" {
#   kubernetes_version = "v1.28.3"
# }

provider "kubernetes" {
  config_path = "~/.kube/config"
}

# Create a namespace for our application
resource "kubernetes_namespace" "financial_system" {
  metadata {
    name = "yape"
  }
}

# PostgreSQL Deployment
resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          image = "postgres:14"
          name  = "postgres"

          env {
            name  = "POSTGRES_USER"
            value = "testuser"
          }
          env {
            name  = "POSTGRES_PASSWORD"
            value = "adminPassword"
          }
          env {
            name  = "POSTGRES_DB"
            value = "financial_system"
          }

          port {
            container_port = 5432
          }

          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
          }
        }

        volume {
          name = "postgres-storage"
          empty_dir {}
        }
      }
    }
  }
}

# PostgreSQL Service
resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.postgres.spec[0].template[0].metadata[0].labels.app
    }
    port {
      port        = 5432
      target_port = 5432
    }
  }
}

# Redis Deployment
resource "kubernetes_deployment" "redis" {
  metadata {
    name      = "redis"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "redis"
      }
    }

    template {
      metadata {
        labels = {
          app = "redis"
        }
      }

      spec {
        container {
          image = "redis:latest"
          name  = "redis"

          port {
            container_port = 6379
          }
        }
      }
    }
  }
}

# Redis Service
resource "kubernetes_service" "redis" {
  metadata {
    name      = "redis"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.redis.spec[0].template[0].metadata[0].labels.app
    }
    port {
      port        = 6379
      target_port = 6379
    }
  }
}

# Zookeeper Deployment
resource "kubernetes_deployment" "zookeeper" {
  metadata {
    name      = "zookeeper"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "zookeeper"
      }
    }

    template {
      metadata {
        labels = {
          app = "zookeeper"
        }
      }

      spec {
        container {
          image = "confluentinc/cp-zookeeper:latest"
          name  = "zookeeper"

          env {
            name  = "ZOOKEEPER_CLIENT_PORT"
            value = "2181"
          }
          env {
            name  = "ZOOKEEPER_TICK_TIME"
            value = "2000"
          }

          port {
            container_port = 2181
          }
        }
      }
    }
  }
}


# Kafka Deployment
resource "kubernetes_deployment" "kafka" {
  metadata {
    name      = "kafka"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "kafka"
      }
    }

    template {
      metadata {
        labels = {
          app = "kafka"
        }
      }

      spec {
        container {
          image = "confluentinc/cp-kafka:latest"
          name  = "kafka"

          env {
            name  = "KAFKA_BROKER_ID"
            value = "1"
          }
          env {
            name  = "KAFKA_ZOOKEEPER_CONNECT"
            value = "zookeeper:2181"
          }
          env {
            name  = "KAFKA_LISTENERS"
            value = "PLAINTEXT://:29092,PLAINTEXT_HOST://:9092"
          }
          env {
            name  = "KAFKA_ADVERTISED_LISTENERS"
            value = "PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092"
          }
          env {
            name  = "KAFKA_LISTENER_SECURITY_PROTOCOL_MAP"
            value = "PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT"
          }
          env {
            name  = "KAFKA_INTER_BROKER_LISTENER_NAME"
            value = "PLAINTEXT"
          }
          env {
            name  = "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR"
            value = "1"
          }

          port {
            container_port = 29092
            name           = "kafka"
          }
          port {
            container_port = 29092
            name           = "kafka-host"
          }
        }
      }
    }
  }
}

# API Gateway Deployment
resource "kubernetes_deployment" "api_gateway" {
  metadata {
    name      = "api-gateway"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "api-gateway"
      }
    }

    template {
      metadata {
        labels = {
          app = "api-gateway"
        }
      }

      spec {
        container {
          image = "kur0dev/api-gateway:latest"  # You'll need to build and push this image to a registry accessible by Minikube
          name  = "api-gateway"

          env {
            name  = "TRANSACTION_SERVICE_URL"
            value = "http://transaction-service:3001"
          }
          env {
            name  = "ANTI_FRAUD_SERVICE_URL"
            value = "http://anti-fraud-service:3002"
          }
          env {
            name  = "STATUS_UPDATE_SERVICE_URL"
            value = "http://status-update-service:3003"
          }

          port {
            container_port = 3000
          }
        }
      }
    }
  }
}

# API Gateway Service
resource "kubernetes_service" "api_gateway" {
  metadata {
    name      = "api-gateway"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.api_gateway.spec[0].template[0].metadata[0].labels.app
    }
    port {
      port        = 3000
      target_port = 3000
      node_port   = 30000  # This will expose the service on port 30000 on each node
    }
    type = "NodePort"
  }
}

# Transaction Service Deployment
resource "kubernetes_deployment" "transaction_service" {
  metadata {
    name      = "transaction-service"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "transaction-service"
      }
    }

    template {
      metadata {
        labels = {
          app = "transaction-service"
        }
      }

      spec {
        container {
          image = "kur0dev/transaction-service:latest"  # You'll need to build and push this image to a registry accessible by Minikube
          name  = "transaction-service"

          env {
            name  = "DB_HOST"
            value = "postgres"
          }
          env {
            name  = "DB_PORT"
            value = "5432"
          }
          env {
            name  = "DB_USERNAME"
            value = "testuser"
          }
          env {
            name  = "DB_PASSWORD"
            value = "adminPassword"
          }
          env {
            name  = "DB_NAME"
            value = "financial_system"
          }
          env {
            name  = "DB_SYNCHRONIZE"
            value = "true"
          }
          env {
            name  = "KAFKA_BROKER"
            value = "kafka:9092"
          }
          env {
            name  = "REDIS_HOST"
            value = "redis"
          }
          env {
            name  = "REDIS_PORT"
            value = "6379"
          }

          port {
            container_port = 3001
          }
        }
      }
    }
  }
}

# Transaction Service Service
resource "kubernetes_service" "transaction_service" {
  metadata {
    name      = "transaction-service"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.transaction_service.spec[0].template[0].metadata[0].labels.app
    }
    port {
      port        = 3001
      target_port = 3001
    }
  }
}

# Anti-Fraud Service Deployment
resource "kubernetes_deployment" "anti_fraud_service" {
  metadata {
    name      = "anti-fraud-service"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "anti-fraud-service"
      }
    }

    template {
      metadata {
        labels = {
          app = "anti-fraud-service"
        }
      }

      spec {
        container {
          image = "kur0dev/anti-fraud-service:latest"  # You'll need to build and push this image to a registry accessible by Minikube
          name  = "anti-fraud-service"
          env {
            name  = "KAFKA_BROKER"
            value = "kafka:9092"
          }
          port {
            container_port = 3002
          }
        }
      }
    }
  }
}

# Anti-Fraud Service Service
resource "kubernetes_service" "anti_fraud_service" {
  metadata {
    name      = "anti-fraud-service"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.anti_fraud_service.spec[0].template[0].metadata[0].labels.app
    }
    port {
      port        = 3002
      target_port = 3002
    }
  }
}

# Status Update Service Deployment
resource "kubernetes_deployment" "status_update_service" {
  metadata {
    name      = "status-update-service"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "status-update-service"
      }
    }

    template {
      metadata {
        labels = {
          app = "status-update-service"
        }
      }

      spec {
        container {
          image = "kur0dev/status-update-service:latest"  # You'll need to build and push this image to a registry accessible by Minikube
          name  = "status-update-service"

          env {
            name  = "DB_HOST"
            value = "postgres"
          }
          env {
            name  = "DB_PORT"
            value = "5432"
          }
          env {
            name  = "DB_USERNAME"
            value = "testuser"
          }
          env {
            name  = "DB_PASSWORD"
            value = "adminPassword"
          }
          env {
            name  = "DB_NAME"
            value = "financial_system"
          }
          env {
            name  = "KAFKA_BROKER"
            value = "kafka:9092"
          }
          env {
            name  = "REDIS_HOST"
            value = "redis"
          }
          env {
            name  = "REDIS_PORT"
            value = "6379"
          }

          port {
            container_port = 3003
          }
        }
      }
    }
  }
}

# Status Update Service Service
resource "kubernetes_service" "status_update_service" {
  metadata {
    name      = "status-update-service"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.status_update_service.spec[0].template[0].metadata[0].labels.app
    }
    port {
      port        = 3003
      target_port = 3003
    }
  }
}

# PgAdmin Deployment
resource "kubernetes_deployment" "pgadmin" {
  metadata {
    name      = "pgadmin"
    namespace = kubernetes_namespace.financial_system.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "pgadmin"
      }
    }

    template {
      metadata {
        labels = {
          app = "pgadmin"
        }
      }

      spec {
        container {
          image = "dpage/pgadmin4:latest"
          name  = "pgadmin"

          env {
            name  = "PGADMIN_DEFAULT_EMAIL"
            value = "admin@admin.com"
          }
          env {
            name  = "PGADMIN_DEFAULT_PASSWORD"
            value = "admin"
          }

          port {
            container_port = 80
          }
        }
      }
    }
  }
}
