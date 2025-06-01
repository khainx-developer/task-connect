#!/bin/sh
# vault-setup.sh

set -e

# Install required packages
apk add --no-cache curl jq

echo "Waiting for Vault to be reachable..."

# Wait until Vault responds with any status code (not just 200)
until curl --silent http://localhost:8200/v1/sys/health > /dev/null; do
  echo "Vault is not reachable yet..."
  sleep 2
done

echo "Vault is reachable. Checking if initialized..."

initialized=$(curl --silent http://localhost:8200/v1/sys/init | jq -r '.initialized')

if [ "$initialized" = "true" ]; then
  echo "Vault is already initialized. Skipping init."
else
  echo "Vault not initialized. Initializing now..."
  vault operator init -format=json > /vault/config/keys.json
  echo "Vault initialized and keys saved to keys.json"
fi

if [ -s /vault/config/keys.json ] && jq -e '.unseal_keys_b64[0]' /vault/config/keys.json > /dev/null 2>&1; then
  echo "Unsealing Vault..."
  sh /vault/scripts/unseal.sh
  echo "Unsealing Vault finished"
else
  echo "No keys found to unseal Vault."
fi

########################################################
# NEW SECTION: Create the task-service token
########################################################

# Wait until Vault is fully unsealed and ready
echo "Waiting for Vault to become ready after unseal..."
until curl --silent http://localhost:8200/v1/sys/health | jq -e '.sealed == false' > /dev/null 2>&1; do
  echo "Vault is still sealed or not ready..."
  sleep 2
done

echo "Vault is unsealed and ready. Creating task-service token..."

# Execute the script to create the token
sh /vault/scripts/create-token.sh

# Store database credentials
echo "Storing database credentials..."
/vault/scripts/store-db-credentials.sh

echo "Vault setup completed successfully!"
