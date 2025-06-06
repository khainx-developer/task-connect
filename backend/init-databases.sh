#!/bin/bash
# init-databases.sh - Idempotent version

set -e
set -u

function create_user_and_database() {
    local database=$1
    local user=$2
    local password=$3

    echo "Checking if user '$user' exists..."
    USER_EXISTS=$(psql -U "${POSTGRES_USER}" -tAc "SELECT 1 FROM pg_roles WHERE rolname='${user}'")
    if [ "$USER_EXISTS" != "1" ]; then
        echo "Creating user '$user'"
        psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
            CREATE USER ${user} WITH PASSWORD '${password}';
EOSQL
    else
        echo "User '$user' already exists"
    fi

    echo "Checking if database '$database' exists..."
    DB_EXISTS=$(psql -U "${POSTGRES_USER}" -tAc "SELECT 1 FROM pg_database WHERE datname='${database}'")
    if [ "$DB_EXISTS" != "1" ]; then
        echo "Creating database '$database' owned by '$user'"
        psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
            CREATE DATABASE ${database} OWNER ${user};
EOSQL
    else
        echo "Database '$database' already exists"
    fi
}

# Create databases and users with their specific passwords
create_user_and_database "keycloak" "keycloak_user" "${KEYCLOAK_DB_PASSWORD}"
create_user_and_database "users" "users_user" "${USERS_DB_PASSWORD}"
create_user_and_database "tasks" "tasks_user" "${TASKS_DB_PASSWORD}"
create_user_and_database "notes" "notes_user" "${NOTES_DB_PASSWORD}"
create_user_and_database "notifications" "notifications_user" "${NOTIFICATIONS_DB_PASSWORD}"
create_user_and_database "payments" "payments_user" "${PAYMENTS_DB_PASSWORD}"
create_user_and_database "bookings" "bookings_user" "${BOOKINGS_DB_PASSWORD}"
create_user_and_database "task_scheduler" "task_scheduler_user" "${TASK_SCHEDULER_DB_PASSWORD}"

echo "All database and user creation checks complete."
