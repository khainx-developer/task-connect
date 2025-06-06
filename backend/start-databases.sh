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
