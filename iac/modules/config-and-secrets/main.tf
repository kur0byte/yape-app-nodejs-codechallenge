resource "kubernetes_config_map" "app_config" {
  metadata {
    name      = "app-config"
    namespace = var.namespace
  }

  data = var.config_data
}

resource "kubernetes_secret" "app_secrets" {
  metadata {
    name      = "app-secrets"
    namespace = var.namespace
  }

  data = {
    DB_USERNAME = var.db_username
    DB_PASSWORD = var.db_password
  }

  type = "Opaque"
}