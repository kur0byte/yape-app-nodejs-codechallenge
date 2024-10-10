resource "kubernetes_deployment" "zookeeper" {
  metadata {
    name      = "zookeeper"
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    replicas = var.zookeeper_replicas

    selector {
      match_labels = {
        app = "zookeeper"
      }
    }

    template {
      metadata {
        labels = merge(var.labels, {
          app = "zookeeper"
        })
      }

      spec {
        container {
          image = "confluentinc/cp-zookeeper:${var.zookeeper_version}"
          name  = "zookeeper"

          port {
            container_port = var.zookeeper_port
          }

          env {
            name  = "ZOOKEEPER_CLIENT_PORT"
            value = var.zookeeper_port
          }

          resources {
            limits   = var.resource_limits.zookeeper
            requests = var.resource_requests.zookeeper
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "zookeeper" {
  metadata {
    name      = "zookeeper-service"
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    selector = {
      app = "zookeeper"
    }

    port {
      port        = var.zookeeper_port
      target_port = var.zookeeper_port
    }
  }
}

resource "kubernetes_deployment" "kafka" {
  metadata {
    name      = "kafka"
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    replicas = var.kafka_replicas

    selector {
      match_labels = {
        app = "kafka"
      }
    }

    template {
      metadata {
        labels = merge(var.labels, {
          app = "kafka"
        })
      }

      spec {
        container {
          image = "confluentinc/cp-kafka:${var.kafka_version}"
          name  = "kafka"

          port {
            container_port = var.kafka_port
          }

          env {
            name  = "KAFKA_ZOOKEEPER_CONNECT"
            value = "zookeeper-service:${var.zookeeper_port}"
          }

          env {
            name  = "KAFKA_ADVERTISED_LISTENERS"
            value = "PLAINTEXT://kafka-service:${var.kafka_port}"
          }

          env {
            name  = "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR"
            value = "1"
          }

          resources {
            limits   = var.resource_limits.kafka
            requests = var.resource_requests.kafka
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "kafka" {
  metadata {
    name      = "kafka-service"
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    selector = {
      app = "kafka"
    }

    port {
      port        = var.kafka_port
      target_port = var.kafka_port
    }
  }
}

