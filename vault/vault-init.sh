#!/bin/sh

echo "Waiting for Vault to be reachable..."

# Wait until Vault responds with any status code (not just 200)
until curl --silent http://vault:8200/v1/sys/health > /dev/null; do
  echo "Vault is not reachable yet..."
  sleep 2
done

echo "Vault is reachable. Checking if initialized..."

initialized=$(curl --silent http://vault:8200/v1/sys/init | jq -r '.initialized')

if [ "$initialized" = "true" ]; then
  echo "Vault is already initialized. Skipping init."
else
  echo "Vault not initialized. Initializing now..."
  vault operator init -format=json > /vault/config/keys.json
  echo "Vault initialized and keys saved to keys.json"
fi

if [ -s /vault/config/keys.json ] && jq -e '.unseal_keys_b64[0]' /vault/config/keys.json > /dev/null 2>&1; then
  echo "Unsealing Vault..."
  sh /vault/unseal.sh
  echo "Unsealing Vault finished"
else
  echo "No keys found to unseal Vault."
fi
