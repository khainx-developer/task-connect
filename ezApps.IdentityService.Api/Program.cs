using System.Text.Json;
using ezApps.IdentityService.Application.Common.Interfaces;
using ezApps.IdentityService.Application.Queries;
using ezApps.IdentityService.Infrastructure.Persistence;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

string credentialsPath = Environment.GetEnvironmentVariable("FIREBASE_CREDENTIALS_PATH") ?? string.Empty;
FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile(credentialsPath)
});

string firebaseProjectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID") ?? string.Empty;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

var secretsFilePath = Environment.GetEnvironmentVariable("SECRETS_FILE_PATH");
var connectionString = "";
if (!string.IsNullOrEmpty(secretsFilePath) && File.Exists(secretsFilePath))
{
    var json = await File.ReadAllTextAsync(secretsFilePath);
    var secrets = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, string>>>(json);
    connectionString = secrets?["ConnectionStrings"]["DefaultConnection"];
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetTasksQuery).Assembly));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync(); // Auto-applies migrations
}

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Identity Service API is running!");

app.MapGet("/secure", (HttpContext context) =>
{
    var user = context.User;
    return user.Identity?.IsAuthenticated ?? false
        ? Results.Ok($"Authenticated as {user.Identity.Name}")
        : Results.Unauthorized();
}).RequireAuthorization();

await app.RunAsync();