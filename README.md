# ez Apps

## Start database
Start the database using Docker Compose. This will create PostgreSQL databases.
```bash
docker-compose up -d
```

Remove the database
```bash
docker-compose down
docker volume rm ezapps_identity_service_data
docker volume rm ezapps_task_manager_data
```

