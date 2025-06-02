# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file first to restore dependencies
COPY ["backend/TaskConnect.ApiGateway/TaskConnect.ApiGateway.csproj", "TaskConnect.ApiGateway/"]

# Restore dependencies
RUN dotnet restore "TaskConnect.ApiGateway/TaskConnect.ApiGateway.csproj"

# Copy only the necessary source files
COPY ["backend/TaskConnect.ApiGateway/", "TaskConnect.ApiGateway/"]

WORKDIR "/src/TaskConnect.ApiGateway"
RUN dotnet build "TaskConnect.ApiGateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskConnect.ApiGateway.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Copy the appropriate Ocelot configuration based on environment
COPY ["backend/TaskConnect.ApiGateway/ocelot.production.json", "ocelot.json"]

ENTRYPOINT ["dotnet", "TaskConnect.ApiGateway.dll"] 