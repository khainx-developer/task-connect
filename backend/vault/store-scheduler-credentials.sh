#!/bin/sh

export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=$(jq -r .root_token /vault/config/keys.json)

# Function to store scheduler credentials
store_scheduler_credentials() {
    local scheduler_name=$1
    local scheduler_user=$2
    local scheduler_password=$3
    
    # Check if the secret already exists
    if vault kv get "secret/data/schedulers/$scheduler_name" >/dev/null 2>&1; then
        echo "Scheduler credentials for '$scheduler_name' already exist in Vault. Skipping..."
        return 0
    fi
    
    echo "Storing credentials for scheduler '$scheduler_name' in Vault..."
    vault kv put "secret/data/schedulers/$scheduler_name" \
        scheduler="$scheduler_name" \
        username="$scheduler_user" \
        password="$scheduler_password"
    
    echo "Successfully stored scheduler credentials for '$scheduler_name'"
}

# Store credentials for each scheduler
store_scheduler_credentials "task_scheduler" "admin" "${TASK_SCHEDULER_DASHBOARD_PASSWORD}"

echo "All scheduler credentials have been processed." 