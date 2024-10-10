resource "kubernetes_config_map_v1_data" "metallb_config" {
  metadata {
    name      = "config"
    namespace = "metallb-system"
  }

  data = {
    config = jsonencode({
      address-pools = [
        {
          name     = "default"
          protocol = "layer2"
          addresses = var.address_pool
        }
      ]
    })
  }

  force = true
}