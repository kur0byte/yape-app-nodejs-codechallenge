# modules/metallb/variables.tf

variable "address_pool" {
  type        = list(string)
  description = "List of IP addresses for MetalLB to use"
}

