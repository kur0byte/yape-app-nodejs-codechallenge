variable "namespace" {
  type = string
}

variable "image_version" {
  type = string
}

variable "replicas" {
  type = number
}

variable "resource_limits" {
  type = map(string)
}

variable "resource_requests" {
  type = map(string)
}

variable "db_name" {
  type = string
}

variable "db_port" {
  type = number
}

variable "config_map_name" {
  type = string
}

variable "secret_name" {
  type = string
}

variable "labels" {
  type = map(string)
}