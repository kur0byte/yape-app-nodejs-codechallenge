resource "kubernetes_ingress_v1" "main" {
  metadata {
    name      = var.name
    namespace = var.namespace
    annotations = {
      "kubernetes.io/ingress.class" = "nginx"
    }
  }

  spec {
    rule {
      http {
        dynamic "path" {
          for_each = var.paths
          content {
            path = path.value["path"]
            path_type = "Prefix"
            backend {
              service {
                name = path.value["service_name"]
                port {
                  number = path.value["service_port"]
                }
              }
            }
          }
        }
      }
    }
  }
}