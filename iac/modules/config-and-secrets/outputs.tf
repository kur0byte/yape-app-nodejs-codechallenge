output "config_map_name" {
  value = kubernetes_config_map.app_config.metadata[0].name
}

output "secret_name" {
  value = kubernetes_secret.app_secrets.metadata[0].name
}