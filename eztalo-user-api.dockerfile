# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/eztalo.UserService.Api/eztalo.UserService.Api.csproj", "eztalo.UserService.Api/"]
RUN dotnet restore "eztalo.UserService.Api/eztalo.UserService.Api.csproj"
COPY ./backend .
WORKDIR "/src/eztalo.UserService.Api"
RUN dotnet build "eztalo.UserService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "eztalo.UserService.Api.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "eztalo.UserService.Api.dll"]
