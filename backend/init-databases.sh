#!/bin/bash
# init-databases.sh - Simplified version

set -e
set -u

function create_user_and_database() {
    local database=$1
    local user=$2
    local password=$3
    echo "Creating user '$user' and database '$database'"
    
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
        CREATE USER $user WITH PASSWORD '$password';
        CREATE DATABASE $database OWNER $user;
EOSQL
}

# Create databases and users with their specific passwords
create_user_and_database "keycloak" "keycloak_user" "${KEYCLOAK_DB_PASSWORD}"
create_user_and_database "users" "users_user" "${USERS_DB_PASSWORD}"
create_user_and_database "tasks" "tasks_user" "${TASKS_DB_PASSWORD}"
create_user_and_database "notes" "notes_user" "${NOTES_DB_PASSWORD}"
create_user_and_database "notifications" "notifications_user" "${NOTIFICATIONS_DB_PASSWORD}"
create_user_and_database "payments" "payments_user" "${PAYMENTS_DB_PASSWORD}"
create_user_and_database "bookings" "bookings_user" "${BOOKINGS_DB_PASSWORD}"

echo "Multiple databases created successfully!"