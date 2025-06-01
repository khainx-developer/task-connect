#!/bin/sh

# Extract unseal keys from keys.json
KEY1=$(jq -r '.unseal_keys_b64[0]' /vault/config/keys.json)
KEY2=$(jq -r '.unseal_keys_b64[1]' /vault/config/keys.json)
KEY3=$(jq -r '.unseal_keys_b64[2]' /vault/config/keys.json)

# Unseal Vault
curl --request PUT --data "{\"key\": \"$KEY1\"}" http://localhost:8200/v1/sys/unseal
curl --request PUT --data "{\"key\": \"$KEY2\"}" http://localhost:8200/v1/sys/unseal
curl --request PUT --data "{\"key\": \"$KEY3\"}" http://localhost:8200/v1/sys/unseal
