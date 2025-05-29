# Task Manager Service

## Update secret

Create a new secret in the `secrets` folder.

## EF migration
```
dotnet ef migrations add AddChecklistItem --project ./eztalo.TaskService.Infrastructure --startup-project ./eztalo.TaskService.Api
```