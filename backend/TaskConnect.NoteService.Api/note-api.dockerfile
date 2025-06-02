# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/eztalo.TaskService.Api/eztalo.TaskService.Api.csproj", "eztalo.TaskService.Api/"]
RUN dotnet restore "eztalo.TaskService.Api/eztalo.TaskService.Api.csproj"
COPY ./backend .
WORKDIR "/src/eztalo.TaskService.Api"
RUN dotnet build "eztalo.TaskService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "eztalo.TaskService.Api.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "eztalo.TaskService.Api.dll"]
