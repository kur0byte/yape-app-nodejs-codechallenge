variable "namespace" {
  type = string
}

variable "kafka_version" {
  type = string
}

variable "zookeeper_version" {
  type = string
}

variable "kafka_replicas" {
  type = number
}

variable "zookeeper_replicas" {
  type = number
}

variable "kafka_port" {
  type = number
}

variable "zookeeper_port" {
  type = number
}

variable "resource_limits" {
  type = map(map(string))
}

variable "resource_requests" {
  type = map(map(string))
}

variable "labels" {
  type = map(string)
}