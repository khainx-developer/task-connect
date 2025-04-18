# ez Apps

## Start database
Start the database using Docker Compose. This will create PostgreSQL databases.
```bash
docker-compose up -d
```

Remove the database
```bash
docker-compose down
docker volume rm eztalo_task_service_data
docker volume rm eztalo_user_service_data
```

