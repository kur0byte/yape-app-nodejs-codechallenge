# Yape Code Challenge: Financial Transaction System
![architecture_diagram](https://github.com/kur0byte/yape-app-nodejs-codechallenge/blob/develop/docs/transaction_architecture_diagram.png)

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Architecture Components](#architecture-components)
4. [Detailed Component Design](#detailed-component-design)
5. [High-Level Workflow](#high-level-workflow)
6. [Scalability and Performance Optimizations](#scalability-and-performance-optimizations)
7. [Implementation Details](#implementation-details)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Strategy](#deployment-strategy)
10. [Conclusion](#conclusion)

## 1. Introduction

This document presents the solution for the Yape Code Challenge, which involves designing and implementing a financial transaction system capable of handling high-volume scenarios. The system is built to create transactions, validate them through an anti-fraud service, and update their status accordingly.

## 2. System Overview

The architecture is designed as a microservices-based system that leverages event-driven communication to ensure scalability, resilience, and real-time processing. It consists of three main services: Transaction Service, Anti-Fraud Service, and Status Update Service. These services communicate through Apache Kafka, use PostgreSQL for data persistence, and employ Redis for caching to optimize performance.

## 3. Architecture Components

### 3.1 Microservices
1. **Transaction Service**: Handles transaction creation and retrieval.
2. **Anti-Fraud Service**: Validates transactions and determines their status.
3. **Status Update Service**: Updates transaction statuses based on anti-fraud results.

### 3.2 Data Stores
1. **Primary Database**: PostgreSQL for transactional data.
2. **Read Replica Database**: PostgreSQL read replicas for scaling read operations.
3. **Redis Cache**: For frequently accessed data and to reduce database load.

### 3.3 Message Broker and Cluster Management
- **Apache Kafka**: For event-driven communication between services.
- **Apache ZooKeeper**: For distributed coordination and management of the Kafka cluster.

### 3.4 API Gateway
- **Node.js with Express.js**: Handles incoming API requests and routes them to appropriate services.

## 4. Detailed Component Design

### 4.1 Transaction Service
- **Framework**: NestJS with TypeORM
- **Responsibilities**:
  - Create new transactions
  - Retrieve transaction details
  - Publish "Transaction Created" events to Kafka

### 4.2 Anti-Fraud Service
- **Framework**: NestJS
- **Responsibilities**:
  - Subscribe to "Transaction Created" events from Kafka
  - Apply fraud detection rules (reject transactions with value > 1000)
  - Publish "Transaction Status Updated" events to Kafka

### 4.3 Status Update Service
- **Framework**: NestJS with TypeORM
- **Responsibilities**:
  - Subscribe to "Transaction Status Updated" events from Kafka
  - Update transaction status in the database
  - Invalidate relevant cache entries

### 4.4 Data Store Design

#### Primary Database Schema (PostgreSQL)

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  external_id UUID UNIQUE NOT NULL,
  account_debit_id UUID NOT NULL,
  account_credit_id UUID NOT NULL,
  transfer_type_id INTEGER NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_external_id ON transactions(external_id);
```

#### Redis Cache Structure

```
Key: transaction:{external_id}
Value: {JSON representation of transaction}
Expiration: 5 minutes
```

## 5. High-Level Workflow

1. Client sends a POST request to create a transaction.
2. API Gateway routes the request to the Transaction Service.
3. Transaction Service:
   a. Validates input
   b. Generates a unique external_id
   c. Saves transaction to PostgreSQL with 'pending' status
   d. Publishes "Transaction Created" event to Kafka
   e. Stores Transaction in Redis cache
   f. Returns transaction details to client
4. Anti-Fraud Service:
   a. Consumes "Transaction Created" event
   b. Applies fraud detection rules
   c. Publishes "Transaction Status Updated" event with new status
5. Status Update Service:
   a. Consumes "Transaction Status Updated" event
   b. Updates transaction status in PostgreSQL
   c. Invalidates Redis cache for the updated transaction

## 6. Scalability and Performance Optimizations

1. **Read Replicas**: Deploy multiple read replicas of the PostgreSQL database to handle high read volumes.
2. **Caching Strategy**:
   - Implement a write-through cache with Redis.
   - Cache frequently accessed transactions to reduce database load.
3. **Kafka Partitioning**: Partition Kafka topics based on transaction external_id to ensure ordered processing within each partition.
4. **Microservice Scaling**:
   - Deploy multiple instances of each microservice.
   - Use a load balancer to distribute incoming requests.
5. **Asynchronous Processing**:
   - Use event-driven architecture to decouple services and allow for independent scaling.
6. **Database Indexing**:
   - Create appropriate indexes on frequently queried columns.

## 7. Implementation Details

### 7.1 Technology Stack
- **Backend**: Node.js with NestJS framework
- **Database**: PostgreSQL
- **Caching**: Redis
- **Message Broker**: Apache Kafka
- **Cluster Management**: Apache ZooKeeper
- **API Gateway**: Express.js
- **ORM**: TypeORM

### 7.2 API Endpoints

#### Create Transaction
- **Method**: POST
- **Endpoint**: `/api/transactions`
- **Request Body**:
  ```json
  {
    "accountExternalIdDebit": "Guid",
    "accountExternalIdCredit": "Guid",
    "tranferTypeId": 1,
    "value": 120
  }
  ```
- **Response**:
  ```json
  {
    "transactionExternalId": "Guid",
    "transactionType": {
      "name": "Transfer"
    },
    "transactionStatus": {
      "name": "pending"
    },
    "value": 120,
    "createdAt": "Date"
  }
  ```

#### Retrieve Transaction
- **Method**: GET
- **Endpoint**: `/api/transactions/{transactionExternalId}`
- **Response**:
  ```json
  {
    "transactionExternalId": "Guid",
    "transactionType": "Transfer",
    "transactionStatus": "approved",
    "value": 120,
    "createdAt": "Date"
  }
  ```

### 7.3 Error Handling
- Implement global exception filters in NestJS to handle and standardize error responses.
- Use custom error classes for different types of errors (e.g., ValidationError, NotFoundError).
- Return appropriate HTTP status codes and error messages.

### 7.4 Logging and Monitoring
- Implement standard nestjs logging.
- Use Prometheus for metrics collection and Grafana for visualization.

## 8. Testing Strategy

### 8.1 Unit Tests
- Write unit tests for individual components and functions using Jest.
- Aim for high test coverage, especially for critical business logic.

### 8.2 Integration Tests
- Implement integration tests to verify the interaction between different services.
- Use tools like Supertest for API testing.

## 9. Deployment Strategy

### 9.1 Containerization
- Use Docker to containerize each microservice and its dependencies.
- Create a docker-compose.yml file for local development and testing.

## 10. Conclusion

This financial transaction system is designed to meet the requirements of the Yape Code Challenge while addressing scalability and performance concerns. By leveraging microservices architecture, event-driven communication, and various optimization techniques, the system is well-equipped to handle high-volume scenarios and provide a robust platform for financial transactions.

The implementation follows best practices in software development, including modular design, comprehensive testing, and a well-defined deployment strategy. This ensures that the system is not only functional but also maintainable and extensible for future enhancements.