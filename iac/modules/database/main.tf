resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = merge(var.labels, {
          app = "postgres"
        })
      }

      spec {
        container {
          image = "postgres:${var.image_version}"
          name  = "postgres"

          port {
            container_port = var.db_port
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = var.secret_name
                key  = "DB_USERNAME"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = var.secret_name
                key  = "DB_PASSWORD"
              }
            }
          }

          env {
            name  = "POSTGRES_DB"
            value = var.db_name
          }

          resources {
            limits   = var.resource_limits
            requests = var.resource_requests
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres-service"
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      port        = var.db_port
      target_port = var.db_port
    }
  }
}