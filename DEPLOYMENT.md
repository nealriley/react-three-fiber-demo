# Deploying the React Three Fiber Demo

This document explains how to deploy the application using Docker, making it accessible from any device on your local network.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Deployment Steps

### Option 1: Using the deploy script (recommended)

1. Make sure Docker is running on your machine
2. Run the deployment script:

```bash
./deploy.sh
```

3. The script will build the Docker image, start the container, and display the URL where you can access the application.

### Option 2: Manual deployment

1. Build and start the Docker container:

```bash
docker-compose up -d --build
```

2. The application will be available at `http://YOUR_LOCAL_IP:8080`

3. To find your local IP address:
   - On macOS/Linux: `hostname -I` or `ifconfig`
   - On Windows: `ipconfig`

## Stopping the Application

To stop the running container:

```bash
docker-compose down
```

## Troubleshooting

### The application isn't accessible from other devices

- Make sure your firewall allows connections on port 8080
- Verify that devices are on the same network
- Try accessing the application using the server's IP address instead of localhost

### Container won't start or crashes

Check the logs for any errors:

```bash
docker-compose logs -f
```

## Customizing the Configuration

- To change the port: Edit the `docker-compose.yml` file and modify the port mapping (default is 8080:80)
- To modify nginx settings: Edit the `nginx.conf` file