# Use the official .NET image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file first to restore dependencies
COPY ["backend/TaskConnect.NoteService.Api/TaskConnect.NoteService.Api.csproj", "TaskConnect.NoteService.Api/"]
COPY ["backend/TaskConnect.NoteService.Domain/TaskConnect.NoteService.Domain.csproj", "TaskConnect.NoteService.Domain/"]
COPY ["backend/TaskConnect.NoteService.Infrastructure/TaskConnect.NoteService.Infrastructure.csproj", "TaskConnect.NoteService.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "TaskConnect.NoteService.Api/TaskConnect.NoteService.Api.csproj"

# Copy only the necessary source files
COPY ["backend/TaskConnect.NoteService.Api/", "TaskConnect.NoteService.Api/"]
COPY ["backend/TaskConnect.NoteService.Domain/", "TaskConnect.NoteService.Domain/"]
COPY ["backend/TaskConnect.NoteService.Infrastructure/", "TaskConnect.NoteService.Infrastructure/"]

WORKDIR "/src/TaskConnect.NoteService.Api"
RUN dotnet build "TaskConnect.NoteService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskConnect.NoteService.Api.csproj" -c Release -o /app/publish

# Final image that copies the build output from the publish stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskConnect.NoteService.Api.dll"]
