# modules/metallb/outputs.tf

output "config_map_name" {
  value       = "config"
  description = "Name of the MetalLB ConfigMap"
}