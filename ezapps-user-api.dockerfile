# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ezApps.TaskManager.Api/ezApps.TaskManager.Api.csproj", "ezApps.TaskManager.Api/"]
RUN dotnet restore "ezApps.TaskManager.Api/ezApps.TaskManager.Api.csproj"
COPY . .
WORKDIR "/src/ezApps.TaskManager.Api"
RUN dotnet build "ezApps.TaskManager.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ezApps.TaskManager.Api.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ezApps.TaskManager.Api.dll"]
