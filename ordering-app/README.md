# Customer Ordering App

This is a **Customer Ordering App** for a two-person project demonstrating inter-application communication using **RabbitMQ**.

Built with **SvelteKit + TypeScript** for the frontend and **Node.js + TypeScript + Express** for the backend, this system allows users to place simple food and drink orders which are sent to another system (Person B) via RabbitMQ.

🐳 **Fully Dockerized** - The entire application stack runs in Docker containers for easy deployment and development.

## Overview

This app is part of a two-part system:

- 👤 **Person A (this repo)** – Customer-facing web app for placing orders.
- 👤 **Person B** – Kitchen Dashboard that receives and manages the orders with PostgreSQL storage.

The two apps communicate via RabbitMQ using shared message queues (`order_created` and `order_status_updated`) for real-time order processing.

View Part B [here](https://github.com/venicephua/kitchen-dashboard) or [here](https://github.com/shanicetanhui/kitchen-dashboard2).

## Features

- 🌐 Modern SvelteKit frontend with static generation
- 🔧 TypeScript backend with Express.js
- 📨 RabbitMQ message queue for order processing
- 🐳 Complete Docker containerization
- 🌐 Nginx reverse proxy for production-ready frontend
- 📊 RabbitMQ Management UI for monitoring

## Tech Stack

- **Frontend:** SvelteKit + TypeScript + Vite
- **Backend:** Node.js + TypeScript + Express
- **Messaging:** RabbitMQ (`amqplib`)
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx (for frontend)
- **Development:** Hot reload enabled

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### Launch the Application

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ordering-app
   ```

2. **Start the entire application stack:**
   ```bash
   docker compose up -d
   ```

3. **Access the application:**
   - 🌐 **Frontend**: http://localhost:8002
   - 🔧 **Backend API**: http://localhost:8001
   - 📊 **RabbitMQ Management**: http://localhost:9002 (admin/admin)

That's it! The entire application is now running in Docker containers.

## Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:8002 | Customer ordering interface |
| Backend API | http://localhost:8001 | REST API endpoints |
| RabbitMQ Management | http://localhost:9002 | Queue monitoring (admin/admin) |

## API Endpoints

### POST /api/order
Place a new order.

**Request:**
```json
{
  "name": "pizza",
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Order received"
}
```

**Example:**
```bash
curl -X POST http://localhost:8001/api/order \
     -H "Content-Type: application/json" \
     -d '{"name":"pizza","quantity":2}'
```

## Development Commands

```bash
# Start the application
docker compose up -d

# Stop the application
docker compose down

# View logs
docker logs ordering-frontend
docker logs ordering-backend
docker logs ordering-rabbitmq

# Rebuild and restart (after code changes)
docker compose up --build -d

# Follow logs in real-time
docker compose logs -f
```

## Project Structure

```
ordering-app/
├── docker-compose.yml          # Orchestrates all services
├── DOCKER.md                   # Docker documentation
├── README.md                   # This file
├── backend/
│   ├── Dockerfile              # Backend container config
│   ├── server.ts               # TypeScript backend server
│   ├── package.json            # Node.js dependencies
│   ├── tsconfig.json           # TypeScript config
│   └── .dockerignore           # Docker build exclusions
└── frontend/
    ├── Dockerfile              # Multi-stage frontend build
    ├── nginx.conf              # Nginx configuration
    ├── svelte.config.js        # SvelteKit static adapter
    ├── package.json            # Frontend dependencies
    ├── src/
    │   ├── routes/
    │   │   ├── +layout.ts      # Prerender configuration
    │   │   └── +page.svelte    # Main ordering page
    │   └── ...
    └── .dockerignore           # Docker build exclusions
```

## Architecture

```mermaid
graph TB
    A[Customer Browser] --> B[Nginx Frontend<br/>:8002]
    B --> C[SvelteKit App]
    C --> D[Backend API<br/>:8001]
    D --> E[RabbitMQ<br/>:9001]
    E --> F[Kitchen Dashboard<br/>Person B - :3001]
    F --> G[PostgreSQL<br/>:5432]
    
    H[RabbitMQ Management<br/>:9002] --> E
    
    E -.-> |order_created| F
    F -.-> |order_status_updated| E
```

## Message Format

Orders are sent to RabbitMQ in the following JSON format:

**To Kitchen Dashboard (order_created queue):**
```json
{
  "name": "item_name",
  "quantity": number
}
```

**From Kitchen Dashboard (order_status_updated queue):**
```json
{
  "orderId": number,
  "status": "pending" | "received" | "completed",
  "updatedAt": "ISO_timestamp"
}
```

## Troubleshooting

### RabbitMQ Management Login Issues
If you get "not_authorized" when logging into RabbitMQ Management UI:

1. **Use correct credentials**: Username: `admin`, Password: `admin`
2. **Clear browser cache** or try in incognito/private mode
3. **Wait for RabbitMQ to fully start**:
   ```bash
   docker logs ordering-rabbitmq --tail 10
   ```
   Look for "Server startup complete" message
4. **Verify user exists**:
   ```bash
   docker exec ordering-rabbitmq rabbitmqctl list_users
   ```
5. **Reset RabbitMQ if needed**:
   ```bash
   docker compose down
   docker volume rm ordering-app_rabbitmq_data
   docker compose up -d
   ```

### Port Conflicts
If you get port conflicts, make sure no other services are running on ports 8001, 8002, 9001, or 9002.

### RabbitMQ Connection Issues
Check the backend logs:
```bash
docker logs ordering-backend
```
Look for "✅ Connected to RabbitMQ" messages.

### Frontend Not Loading
Check if the frontend container is running:
```bash
docker ps
```
And check nginx logs:
```bash
docker logs ordering-frontend
```

## For Person B (Message Consumer)

To consume messages from the RabbitMQ queue in your separate Kitchen Dashboard application:

1. Connect to RabbitMQ at `localhost:9001`
2. Use credentials: `admin/admin`
3. Listen to the `orderQueue` queue
4. Send status updates back via `orderStatus` queue
5. Process incoming JSON messages in this format:

**Order Message Format:**
```json
{
  "name": "pizza",
  "quantity": 2
}
```

**Status Update Format (from Kitchen Dashboard):**
```json
{
  "orderId": 1,
  "status": "completed",
  "updatedAt": "2025-07-01T10:30:00Z"
}
```

## Security Notes

### Development vs Production
This project uses default credentials (`admin/admin`) for local development. For production deployment:

1. **Change default credentials**:
   ```bash
   # Create a .env file (not tracked in git)
   cp .env.example .env
   # Edit .env with secure credentials
   ```

2. **Use environment variables**:
   ```bash
   export RABBITMQ_DEFAULT_USER=your_secure_username
   export RABBITMQ_DEFAULT_PASS=your_secure_password
   ```

3. **Never commit real credentials** to version control.

### What's Safe in This Repo
✅ Development credentials (admin/admin)  
✅ Localhost references  
✅ Docker configuration  
✅ Source code  

### What to Keep Private
❌ Production credentials  
❌ Real API keys  
❌ .env files with secrets  

## Contributing

1. Make your changes
2. Rebuild the containers: `docker compose up --build -d`
3. Test the functionality
4. Submit your changes

## License

This project is for educational purposes.
