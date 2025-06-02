# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file first to restore dependencies
COPY ["backend/TaskConnect.TaskService.Api/TaskConnect.TaskService.Api.csproj", "TaskConnect.TaskService.Api/"]
COPY ["backend/TaskConnect.TaskService.Domain/TaskConnect.TaskService.Domain.csproj", "TaskConnect.TaskService.Domain/"]
COPY ["backend/TaskConnect.TaskService.Infrastructure/TaskConnect.TaskService.Infrastructure.csproj", "TaskConnect.TaskService.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "TaskConnect.TaskService.Api/TaskConnect.TaskService.Api.csproj"

# Copy only the necessary source files
COPY ["backend/TaskConnect.TaskService.Api/", "TaskConnect.TaskService.Api/"]
COPY ["backend/TaskConnect.TaskService.Domain/", "TaskConnect.TaskService.Domain/"]
COPY ["backend/TaskConnect.TaskService.Infrastructure/", "TaskConnect.TaskService.Infrastructure/"]

WORKDIR "/src/TaskConnect.TaskService.Api"
RUN dotnet build "TaskConnect.TaskService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskConnect.TaskService.Api.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskConnect.TaskService.Api.dll"]
