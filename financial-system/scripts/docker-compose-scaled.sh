#!/bin/zsh
transaction_replicas=2
antifraud_replicas=2
statusUpdate_replicas=2

docker compose up --build --scale transaction-service=$transaction_replicas --scale anti-fraud-service=$antifraud_replicas --scale status-update-service=$statusUpdate_replicas -d
