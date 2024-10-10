resource "kubernetes_deployment" "service" {
  metadata {
    name      = var.name
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = var.name
      }
    }

    template {
      metadata {
        labels = merge(var.labels, {
          app = var.name
        })
      }

      spec {
        container {
          image = var.image
          name  = var.name

          port {
            container_port = var.port
          }

          env_from {
            config_map_ref {
              name = var.config_map_name
            }
          }

          dynamic "env_from" {
            for_each = var.secret_name != null ? [1] : []
            content {
              secret_ref {
                name = var.secret_name
              }
            }
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

resource "kubernetes_service" "service" {
  metadata {
    name      = var.name
    namespace = var.namespace
    labels    = var.labels
  }
  spec {
    selector = {
      app = var.name
    }
    port {
      port        = var.port
      target_port = var.port
    }
    type = var.service_type
  }
}