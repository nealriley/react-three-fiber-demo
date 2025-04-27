#!/bin/bash

# Build and deploy the React Three Fiber application

# Make script exit on any error
set -e

# Get the local IP address
ip_address=$(hostname -I | awk '{print $1}')

echo "🚀 Building and deploying React Three Fiber demo"
echo "==============================================="

# Build and start Docker containers
echo "🔨 Building Docker image and starting container..."
docker-compose up -d --build

echo "✅ Deployment complete!"
echo "==============================================="
echo "📱 You can access the application at:"
echo "   http://$ip_address:8080"
echo ""
echo "💻 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"