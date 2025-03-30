using System.Text.Json;
using ezApps.IdentityService.Application.Common.Interfaces;
using ezApps.IdentityService.Application.Queries;
using ezApps.IdentityService.Infrastructure.Persistence;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var secretsFilePath = Environment.GetEnvironmentVariable("SECRETS_FILE_PATH");
var connectionString = "";
var credentialsPath = "";
var firebaseProjectId = "";
if (!string.IsNullOrEmpty(secretsFilePath) && File.Exists(secretsFilePath))
{
    var json = await File.ReadAllTextAsync(secretsFilePath);
    var secrets = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, string>>>(json);
    connectionString = secrets?["ConnectionStrings"]["DefaultConnection"];
    credentialsPath = secrets?["FirebaseCredentials"]["FirebaseCredentialsPath"];
    firebaseProjectId = secrets?["FirebaseCredentials"]["FirebaseProjectId"];
}

FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile(credentialsPath)
});

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

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetTasksQuery).Assembly));
builder.Services.AddControllers();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Identity Service API",
        Version = "v1",
        Description = "API for user authentication using Firebase and JWT",
    });

    // Add authentication support in Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token with 'Bearer ' prefix (e.g., 'Bearer YOUR_TOKEN_HERE')"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync(); // Auto-applies migrations
}

// Enable Swagger UI
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Identity Service API v1");
        options.RoutePrefix = "swagger"; // Swagger at root URL
    });
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();