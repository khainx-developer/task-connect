using System.Text.Json;
using eztalo.TaskService.Api.Services;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Application.Queries.TaskQueries;
using eztalo.TaskService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

var secretsFilePath = Environment.GetEnvironmentVariable("SECRETS_FILE_PATH");
Dictionary<string, Dictionary<string, string>> secrets = null;
if (!string.IsNullOrEmpty(secretsFilePath) && File.Exists(secretsFilePath))
{
    var json = await File.ReadAllTextAsync(secretsFilePath);
    secrets = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, string>>>(json);
}

AddAuthentication(secrets, builder);

var myAllowSpecificOrigins = "_myAllowSpecificOrigins";
AddCors(builder, myAllowSpecificOrigins);

builder.Services.AddAuthorization();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var connectionString = secrets?["ConnectionStrings"]["DefaultConnection"];
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

builder.Services.AddScoped<IUserContextService, UserContextService>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetAllTasksQuery).Assembly));
builder.Services.AddControllers();

AddSwagger(builder);

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync(); // Auto-applies migrations

    foreach (var note in dbContext.Notes.ToList())
    {
        note.OwnerId = "1220ebbf-714e-4e25-b9c0-959a25609032";
    }

    await dbContext.SaveChangesAsync();
}

UseSwagger(app);

app.UseCors(myAllowSpecificOrigins);
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Enable Prometheus HTTP request metrics middleware
app.UseHttpMetrics();

// Expose /metrics endpoint
app.MapMetrics();

// Expose native ASP.NET Core /health endpoint (optional)
app.MapHealthChecks("/health");

await app.RunAsync();
return;

void AddSwagger(WebApplicationBuilder webApplication)
{
    webApplication.Services.AddEndpointsApiExplorer();
    webApplication.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Task Manager Service API",
            Version = "v1",
            Description = "API for user authentication",
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
}

void UseSwagger(WebApplication webApplication)
{
    if (!webApplication.Environment.IsProduction())
    {
        webApplication.UseSwagger();
        webApplication.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Manager Service API v1");
            options.RoutePrefix = "swagger"; // Swagger at root URL
        });
    }
}

void AddCors(WebApplicationBuilder webApplication, string originName)
{
    var allowedOrigins = webApplication.Configuration.GetSection("CorsOrigins").Get<List<string>>() ??
                         new List<string>();

    webApplication.Services.AddCors(options =>
    {
        options.AddPolicy(name: originName,
            policy =>
            {
                policy.SetIsOriginAllowed(origin =>
                    {
                        foreach (var allowedOrigin in allowedOrigins)
                        {
                            if (allowedOrigin.StartsWith("."))
                            {
                                // Wildcard subdomain check
                                if (origin.EndsWith(allowedOrigin))
                                    return true;
                            }
                            else
                            {
                                // Exact match
                                if (origin == allowedOrigin)
                                    return true;
                            }
                        }

                        return false;
                    })
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
    });
}

void AddAuthentication(Dictionary<string, Dictionary<string, string>> secretsDictionary,
    WebApplicationBuilder webApplicationBuilder)
{
    var issuer = secretsDictionary?["AuthSettings"]["Issuer"];

    webApplicationBuilder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = issuer;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = "account",
                ValidateLifetime = true
            };
        });
}