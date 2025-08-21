# Docker Setup for Ordering App

## Quick Start

1. **Make sure Docker Desktop is running**

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - RabbitMQ Management: http://localhost:15672 (admin/admin)

## Docker Commands

```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build

# View running containers
docker-compose ps
```

## Services

- **Frontend**: Svelte app served by Nginx on port 3000
- **Backend**: Node.js TypeScript API on port 3001
- **RabbitMQ**: Message queue with management UI on port 15672

## Development

The backend includes volume mounting for live reloading during development. Changes to your TypeScript files will automatically restart the server.

## Troubleshooting

If you encounter issues:
1. Make sure Docker Desktop is running
2. Try `docker-compose down` then `docker-compose up --build`
3. Check logs with `docker-compose logs -f [service-name]`
