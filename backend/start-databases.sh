#!/bin/bash

# Check and create vault directory if it doesn't exist
if [ ! -d "vault" ]; then
    mkdir vault
fi

# Check and create token.txt if it doesn't exist
if [ ! -f "vault/token.txt" ]; then
    touch vault/token.txt
fi

# Check and create keys.json if it doesn't exist
if [ ! -f "vault/keys.json" ]; then
    echo "{}" > vault/keys.json
fi

# Start the databases
docker-compose -f docker-compose-databases.yml --env-file .docker-env up -d
sleep 10
docker exec -i task-connect-postgres bash < ./init-databases.sh

# Wait for Ollama service to be ready
echo "Waiting for Ollama service to be ready..."
sleep 10

# Check if Ollama container is running
if ! docker ps --format "table {{.Names}}" | grep -q "task-connect-ai"; then
    echo "Error: task-connect-ai container is not running"
    exit 1
fi

# Check if llama3.2 model is already pulled
echo "Checking if Llama 3.2 model is available..."
if docker exec task-connect-ai ollama list | grep -q "llama3.2"; then
    echo "✓ Llama 3.2 model is already available"
else
    echo "Llama 3.2 model not found. Pulling model..."
    docker exec task-connect-ai ollama pull llama3.2:3b
    
    # Verify the pull was successful
    if docker exec task-connect-ai ollama list | grep -q "llama3.2"; then
        echo "✓ Llama 3.2 model successfully pulled"
    else
        echo "✗ Failed to pull Llama 3.2 model"
        exit 1
    fi
fi

echo "Setup complete!"