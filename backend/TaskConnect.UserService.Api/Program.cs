using TaskConnect.Api.Core.Middlewares;
using TaskConnect.Infrastructure.Core;
using TaskConnect.UserService.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Prometheus;
using Serilog;
using Serilog.Context;
using Serilog.Events;
using TaskConnect.Infrastructure.Core.Models;
using TaskConnect.UserService.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

var vaultClientFactory = new VaultClientFactory();
var vaultSecretProvider = new VaultSecretProvider(vaultClientFactory);
var databaseConfig = await vaultSecretProvider.GetJsonSecretAsync<DatabaseConfig>("data/databases/users");

var issuer = builder.Configuration["AuthSettings:Issuer"];
builder.Services
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

const string myAllowSpecificOrigins = "_myAllowSpecificOrigins";
var allowedOrigins = builder.Configuration.GetSection("CorsOrigins").Get<List<string>>() ?? new List<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
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

builder.Services.AddAuthorization();

var connectionString =
    $"Host={databaseConfig.Host};Port={databaseConfig.Port};Database={databaseConfig.Database};Username={databaseConfig.Username};Password={databaseConfig.Password}";
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(IApplicationDbContext).Assembly));
builder.Services.AddControllers();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "User Service API",
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

// Add health checks
builder.Services.AddHealthChecks();
builder.Host.UseSerilog((context, services, configuration) =>
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

// Enable Swagger UI
if (!app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "User Service API v1");
        options.RoutePrefix = "swagger"; // Swagger at root URL
    });
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

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