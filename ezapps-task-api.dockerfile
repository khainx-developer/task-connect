# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ezApps.TaskService.Api/ezApps.TaskService.Api.csproj", "ezApps.TaskService.Api/"]
RUN dotnet restore "ezApps.TaskService.Api/ezApps.TaskService.Api.csproj"
COPY . .
WORKDIR "/src/ezApps.TaskService.Api"
RUN dotnet build "ezApps.TaskService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ezApps.TaskService.Api.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ezApps.TaskService.Api.dll"]
