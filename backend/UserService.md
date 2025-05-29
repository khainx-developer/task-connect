# User Service

## Update secret

Create a new secret in the `secrets` folder.

## EF migration
```
dotnet ef migrations add InitDatabase --project ./eztalo.UserService.Infrastructure --startup-project ./eztalo.UserService.Api
```