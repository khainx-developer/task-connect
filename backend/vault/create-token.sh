#!/bin/sh

export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=$(jq -r .root_token /vault/config/keys.json)

# Enable secrets engine if not already enabled
if ! vault secrets list 2>/dev/null | grep -q "secret/"; then
  echo "Enabling KV secrets engine..."
  vault secrets enable -path=secret kv-v2
  echo "KV secrets engine enabled!"
else
  echo "KV secrets engine already enabled"
fi

# Wait until Vault is fully unsealed and ready
echo "Waiting for Vault to become ready after unseal..."
until curl --silent http://localhost:8200/v1/sys/health | jq -e '.sealed == false' > /dev/null 2>&1; do
  echo "Vault is still sealed or not ready..."
  sleep 2
done

# Define policy name and path to store token
POLICY_NAME="app-policy"
TOKEN_FILE="/vault/config/token.txt"
POLICY_FILE="/tmp/${POLICY_NAME}.hcl"

# Check if the token file already exists and has a valid-looking token
if [ -s "$TOKEN_FILE" ]; then
  echo "Token file $TOKEN_FILE already exists and is not empty. Skipping token creation."
  exit 0
fi

# Define the policy
cat <<EOF > "$POLICY_FILE"
path "secret/data/*" {
  capabilities = ["create", "update", "read", "list"]
}
EOF

echo "Uploading policy to Vault..."

# Upload the policy to Vault
vault policy write "$POLICY_NAME" "$POLICY_FILE"

echo "Creating token with policy '$POLICY_NAME'..."

# Create the token and extract it
TOKEN=$(vault token create -policy="$POLICY_NAME" -format=json | jq -r .auth.client_token)

# Save token to file
echo "$TOKEN" > "$TOKEN_FILE"

echo "Token created and saved to $TOKEN_FILE"

# Clean up policy file
rm "$POLICY_FILE"
