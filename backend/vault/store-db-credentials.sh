#!/bin/sh

export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=$(jq -r .root_token /vault/config/keys.json)

# Function to store database credentials
store_database_credentials() {
    local db_name=$1
    local db_user=$2
    local db_password=$3
    
    # Check if the secret already exists
    if vault kv get "secret/data/databases/$db_name" >/dev/null 2>&1; then
        echo "Database credentials for '$db_name' already exist in Vault. Skipping..."
        return 0
    fi
    
    echo "Storing credentials for database '$db_name' in Vault..."
    vault kv put "secret/data/databases/$db_name" \
        host="localhost" \
        port="15432" \
        database="$db_name" \
        username="$db_user" \
        password="$db_password"
    
    echo "Successfully stored credentials for '$db_name'"
}

# Store credentials for each database
store_database_credentials "users" "users_user" "${USERS_DB_PASSWORD}"
store_database_credentials "tasks" "tasks_user" "${TASKS_DB_PASSWORD}"
store_database_credentials "notes" "notes_user" "${NOTES_DB_PASSWORD}"
store_database_credentials "notifications" "notifications_user" "${NOTIFICATIONS_DB_PASSWORD}"
store_database_credentials "payments" "payments_user" "${PAYMENTS_DB_PASSWORD}"
store_database_credentials "bookings" "bookings_user" "${BOOKINGS_DB_PASSWORD}"

echo "All database credentials have been processed." 