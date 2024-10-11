provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "minikube"
}

resource "kubernetes_namespace" "yape" {
  metadata {
    name = "yape"
  }
}

# Zookeeper
resource "kubernetes_deployment" "zookeeper" {
  metadata {
    name      = "zookeeper"
    namespace = kubernetes_namespace.yape.metadata[0].name
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

          port {
            container_port = 2201
          }

          env {
            name  = "ZOOKEEPER_CLIENT_PORT"
            value = "2201"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "zookeeper" {
  metadata {
    name      = "zookeeper"
    namespace = kubernetes_namespace.yape.metadata[0].name
  }

  spec {
    selector = {
      app = "zookeeper"
    }

    port {
      port        = 2201
      target_port = 2201
    }
  }
}

# Kafka
resource "kubernetes_deployment" "kafka" {
  metadata {
    name      = "kafka"
    namespace = kubernetes_namespace.yape.metadata[0].name
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
          image = "confluentinc/cp-enterprise-kafka:latest"
          name  = "kafka"

          port {
            container_port = 9092
          }

          env {
            name  = "KAFKA_BROKER_ID"
            value = "1"
          }

          env {
            name  = "KAFKA_ZOOKEEPER_CONNECT"
            value = "zookeeper:2201"
          }

          env {
            name  = "KAFKA_ADVERTISED_LISTENERS"
            value = "PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9092"
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

          env {
            name  = "KAFKA_CONFLUENT_LICENSE"
            value = "your-license-key" # Optional for enterprise features
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "kafka" {
  metadata {
    name      = "kafka"
    namespace = kubernetes_namespace.yape.metadata[0].name
  }

  spec {
    selector = {
      app = "kafka"
    }

    port {
      port        = 9092
      target_port = 9092
    }
  }
}

# API Gateway
resource "kubernetes_deployment" "api_gateway" {
  metadata {
    name      = "api-gateway"
    namespace = kubernetes_namespace.yape.metadata[0].name
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
          image = "kur0dev/api-gateway:latest"
          name  = "api-gateway"

          port {
            container_port = 3000
          }

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
        }
      }
    }
  }
}

resource "kubernetes_service" "api_gateway" {
  metadata {
    name      = "api-gateway"
    namespace = kubernetes_namespace.yape.metadata[0].name
  }

  spec {
    selector = {
      app = "api-gateway"
    }

    port {
      port        = 3000
      target_port = 3000
    }

    type = "NodePort"
  }
}

# Transaction Service
resource "kubernetes_deployment" "transaction_service" {
  metadata {
    name      = "transaction-service"
    namespace = kubernetes_namespace.yape.metadata[0].name
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
          image = "kur0dev/transaction-service:latest"
          name  = "transaction-service"

          port {
            container_port = 3001
          }

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
        }
      }
    }
  }
}

resource "kubernetes_service" "transaction_service" {
  metadata {
    name      = "transaction-service"
    namespace = kubernetes_namespace.yape.metadata[0].name
  }

  spec {
    selector = {
      app = "transaction-service"
    }

    port {
      port        = 3001
      target_port = 3001
    }
  }
}

# Anti-Fraud Service
resource "kubernetes_deployment" "anti_fraud_service" {
  metadata {
    name      = "anti-fraud-service"
    namespace = kubernetes_namespace.yape.metadata[0].name
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
          image = "kur0dev/anti-fraud-service:latest"
          name  = "anti-fraud-service"

          port {
            container_port = 3002
          }

          env {
            name  = "KAFKA_BROKER"
            value = "kafka:9092"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "anti_fraud_service" {
  metadata {
    name      = "anti-fraud-service"
    namespace = kubernetes_namespace.yape.metadata[0].name
  }

  spec {
    selector = {
      app = "anti-fraud-service"
    }

    port {
      port        = 3002
      target_port = 3002
    }
  }
}

# Status Update Service
resource "kubernetes_deployment" "status_update_service" {
  metadata {
    name      = "status-update-service"
    namespace = kubernetes_namespace.yape.metadata[0].name
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
          image = "kur0dev/status-update-service:latest"
          name  = "status-update-service"

          port {
            container_port = 3003
          }

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
        }
      }
    }
  }
}

resource "kubernetes_service" "status_update_service" {
  metadata {
    name      = "status-update-service"
    namespace = kubernetes_namespace.yape.metadata[0].name
  }

  spec {
    selector = {
      app = "status-update-service"
    }

    port {
      port        = 3003
      target_port = 3003
    }
  }
}