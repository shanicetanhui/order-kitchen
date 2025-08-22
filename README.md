# Order Kitchen Unified Setup

This repository contains both the Kitchen Dashboard and Ordering App, fully dockerized for easy local development and deployment.

View Part 1 (ordering-app) [here](https://github.com/shanicetanhui/ordering-app).  
View Part 2 (kitchen-dashboard) [here](https://github.com/venicephua/kitchen-dashboard).

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/shanicetanhui/order-kitchen.git
cd order-kitchen
```

### 2. Add environment files
Copy the template `.env.example` to `.env` in each of these folders and fill in any secrets:

```bash
cp .env.example .env
cp .env.example kitchen-dashboard/.env
cp .env.example ordering-app/.env
```

You can edit each `.env` file as needed for local development or deployment.

### 3. Build and start all services
Make sure Docker Desktop is running.
```bash
docker-compose up -d --build
```

### 4. Access the applications
- **Ordering Frontend:** [http://localhost:8002](http://localhost:8002)
- **Ordering Backend:** [http://localhost:8001](http://localhost:8001)
- **Kitchen Frontend:** [http://localhost:3001](http://localhost:3001)
- **Kitchen Backend:** [http://localhost:3000](http://localhost:3000)
- **RabbitMQ UI:** [http://localhost:9002](http://localhost:9002) (user: admin, pass: admin)

## Stopping Everything
```bash
docker-compose down
```

## Updating Your Code
```bash
git pull
```

## Notes
- Make sure your `.env` file is not committed (see `.gitignore`).
- If you see port conflicts, change the left side of the port mappings in `docker-compose.yml`.
- For troubleshooting, check logs:
  ```bash
  docker-compose logs
  ```

## Image Credits

All images used in this project are either original, free for commercial use, or properly attributed as required by their license.
