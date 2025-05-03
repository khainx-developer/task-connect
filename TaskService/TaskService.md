# Task Manager Service

## Update secret

Create a new secret in the `secrets` folder. The secret should be a JSON file containing the Firebase credentials.
The file should be named `ez-apps-admin-sdk.json`.
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=25432;Database=task-service;Username=admin;Password=password"
  },
  "FirebaseCredentials": {
    "FirebaseProjectId": "the firebase project id",
    "FirebaseCredentialsPath": "../secrets/ez-apps-admin-sdk.json"
  }
}
```

Download the Firebase credentials from the Firebase console. Go to Project Settings > Service accounts > Generate new private key. This will download a JSON file with the credentials.
Add the firebase admin sdk credentials `ez-apps-admin-sdk.json` to the `secrets` folder.

## EF migration
```
dotnet ef migrations add AddChecklistItem --project ./eztalo.TaskService.Infrastructure --startup-project ./eztalo.TaskService.Api
```