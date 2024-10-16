# Yape Financial Transaction System

This project implements a scalable financial transaction system for Yape, designed to handle high-volume scenarios with real-time processing and fraud detection.

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Services](#services)
5. [Network Architecture](#network-architecture)
5. [Load Balancing](#load-balancing)
5. [Scaling Services](#scaling-services)
5. [API Endpoints](#api-endpoints)
6. [Development](#development)
7. [Testing](#testing)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

## Project Structure

The project is organized into the following main directories:

```
.
├── financial-system/
│   ├── api-gateway
│   ├── anti-fraud-service
│   ├── transaction-service
│   ├── status-update-service
│   ├── dockerfiles
│   ├── docker-compose.yml
│   ├── config/
│   │    ├── db/
│   │    └── nginx/
├── iac/
│   └── main.tf
├── ARCHITECTURE.md  ## High-level workflows
├── README.md        ## Project Initialization
├── CHALLENGE.md     ## Yape Challenge
└── build-docker.sh
```

- `iac/`: Terraform Infrastructure As Code Experiments
- `config/`: Configuration files for services like `nginx` & `postgres`
- `api-gateway/`: NestJS API gateway service
- `transaction-service/`: NestJS service for creating and retrieving transactions
- `anti-fraud-service/`: NestJS service for transaction validation
- `status-update-service/`: NestJS service for updating transaction statuses
- `dockerfiles`: Docker files for all projects
- `docker-compose.yml`: Docker Compose configuration for local development
- `ARCHITECTURE.md`: Detailed system architecture documentation
- `README.md`: This file
- `CHALLENGE.md`: Yape challenge description

## Prerequisites

Ensure you have the following installed on your system:

- Docker
- Docker Compose
- Node.js > 20.x.x (for local development)
- npm (for local development)

## Getting Started

To initialize and run the project using Docker Compose, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/kur0byte/yape-app-nodejs-codechallenge.git
   cd financial-system
   ```

2. Start the services using Docker Compose:
   ```
   docker-compose up -d
   ```

   This command will build and start all the services defined in the `docker-compose.yml` file, including PostgreSQL, Redis, Kafka, Zookeeper, and the microservices.

3. Wait for all services to be up and running. You can check the status with:
   ```
   docker-compose ps
   ```

4. The API Gateway will be accessible at `http://localhost:3000`.

## Services

- **API Gateway**: Handles incoming API requests (Port 3000)
- **Transaction Service**: Manages transaction creation and retrieval (Port 3001)
- **Anti-Fraud Service**: Validates transactions
- **Status Update Service**: Updates transaction statuses
- **Nginx Load Balancers**: Each service has its own Nginx load balancer to distribute requests
- **PostgreSQL**: Primary database (Port 5432)
- **PostgreSQL Replica**: Read replica for the primary database (Port 5433)
- **Redis**: Caching layer (Port 6379)
- **Kafka**: Message broker (Port 9092)
- **Zookeeper**: Distributed coordination service (Port 2201)
- **pgAdmin**: Database management tool (Port 5050)

## Network Architecture

The system is designed with two distinct network layers:
1. Public Network:
   - Accessible from outside the system
   - Contains the main load balancer and API Gateway
2. Internal Network:
   - Isolated from direct external access
   - Contains all microservices, databases, caching layer, and message brokers
   - Enhances security by limiting exposure of critical components

## Load Balancing

Each microservice in this system is fronted by an Nginx load balancer.

The Nginx configurations for each service can be found in the `nginx/` directory. To modify the load balancing strategy or add more service instances, update the respective Nginx configuration file and the `docker-compose.yml` file.

## Scaling Services

To scale a service, you can use Docker Compose's scale command. For example, to run 3 instances of the transaction service:

```bash
docker compose up --scale transaction-service=3 -d
```

For example:
```bash
docker compose up --build --scale transaction-service=3 --scale anti-fraud-service=3 --scale status-update-service=3 --scale api-gateway=3 -d
```

The Nginx load balancer will automatically distribute requests among these instances.

## API Endpoints

- Create Transaction: `POST /api/transactions`
- Retrieve Transaction: `GET /api/transactions/{transactionExternalId}`

For detailed API documentation, refer to the [API Documentation](http://localhost:3000/api/transactions/docs)

## Development

To work on individual services:

1. Navigate to the service directory (e.g., `cd transaction-service`)
2. Install dependencies: `npm install`
3. Run the service locally: `npm run start:dev`

Make sure to update the environment variables in the `docker-compose.yml` file if you're running services outside of Docker.

## Testing

Run tests for each service:

```
cd service-name
npm run test
```

## Monitoring

- Access pgAdmin at `http://localhost:5050` for database monitoring

## Troubleshooting

- If services fail to start, check the logs using `docker-compose logs service-name`
- Ensure all required ports are free on your system
- For database connection issues, verify the PostgreSQL connection settings in the service configurations

For more detailed information about the system architecture and design decisions, please refer to the [ARCHITECTURE.md](ARCHITECTURE.md) file.