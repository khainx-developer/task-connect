# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ezApps.UserService.Api/ezApps.UserService.Api.csproj", "ezApps.UserService.Api/"]
RUN dotnet restore "ezApps.UserService.Api/ezApps.UserService.Api.csproj"
COPY . .
WORKDIR "/src/ezApps.UserService.Api"
RUN dotnet build "ezApps.UserService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ezApps.UserService.Api.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ezApps.UserService.Api.dll"]
