# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file first to restore dependencies
COPY ["backend/TaskConnect.Api.Core/TaskConnect.Api.Core.csproj", "TaskConnect.Api.Core/"]
COPY ["backend/TaskConnect.Infrastructure.Core/TaskConnect.Infrastructure.Core.csproj", "TaskConnect.Infrastructure.Core/"]
COPY ["backend/TaskConnect.UserService.Api/TaskConnect.UserService.Api.csproj", "TaskConnect.UserService.Api/"]
COPY ["backend/TaskConnect.UserService.Domain/TaskConnect.UserService.Domain.csproj", "TaskConnect.UserService.Domain/"]
COPY ["backend/TaskConnect.UserService.Application/TaskConnect.UserService.Application.csproj", "TaskConnect.UserService.Application/"]
COPY ["backend/TaskConnect.UserService.Infrastructure/TaskConnect.UserService.Infrastructure.csproj", "TaskConnect.UserService.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "TaskConnect.UserService.Api/TaskConnect.UserService.Api.csproj"

# Copy only the necessary source files
COPY ["backend/TaskConnect.Api.Core/", "TaskConnect.Api.Core/"]
COPY ["backend/TaskConnect.Infrastructure.Core/", "TaskConnect.Infrastructure.Core/"]
COPY ["backend/TaskConnect.UserService.Api/", "TaskConnect.UserService.Api/"]
COPY ["backend/TaskConnect.UserService.Domain/", "TaskConnect.UserService.Domain/"]
COPY ["backend/TaskConnect.UserService.Application/", "TaskConnect.UserService.Application/"]
COPY ["backend/TaskConnect.UserService.Infrastructure/", "TaskConnect.UserService.Infrastructure/"]

WORKDIR "/src/TaskConnect.UserService.Api"
RUN dotnet build "TaskConnect.UserService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskConnect.UserService.Api.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskConnect.UserService.Api.dll"]
