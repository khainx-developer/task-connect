using System.Text.Json;
using eztalo.Api.Core.Middlewares;
using eztalo.Infrastructure.Core;
using eztalo.TaskService.Api.Services;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Application.Queries.TaskQueries;
using eztalo.TaskService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Prometheus;
using Serilog;
using Serilog.Context;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
Dictionary<string, Dictionary<string, string>> secrets = null;
if (!string.IsNullOrEmpty(env))
{
    var vaultClientFactory = new VaultClientFactory();
    var vaultSecretProvider = new VaultSecretProvider(vaultClientFactory);
    var json = await vaultSecretProvider.GetSecretAsync(env, "task-service", "app-settings");
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
builder.Host.UseSerilog((context, _, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext();
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync(); // Auto-applies migrations
}

UseSwagger(app);
app.Use(async (context, next) =>
{
    using (LogContext.PushProperty("RequestId", context.TraceIdentifier))
    {
        await next.Invoke();
    }
});
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSerilogRequestLogging(opts =>
{
    opts.GetLevel = (httpContext, elapsed, ex) =>
    {
        // Suppress /metrics logging
        if (httpContext.Request.Path.StartsWithSegments("/metrics"))
        {
            return LogEventLevel.Verbose; // Or return null to skip logging
        }

        return LogEventLevel.Information;
    };
});
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

try
{
    Log.Information("Starting up...");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application start-up failed");
}
finally
{
    Log.CloseAndFlush();
}

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
                []
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