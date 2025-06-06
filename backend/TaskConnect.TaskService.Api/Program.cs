using TaskConnect.Api.Core.Middlewares;
using TaskConnect.Infrastructure.Core;
using TaskConnect.TaskService.Application.Queries.TaskQueries;
using TaskConnect.TaskService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Prometheus;
using Serilog;
using Serilog.Context;
using Serilog.Events;
using TaskConnect.Api.Core.Services;
using TaskConnect.Infrastructure.Core.Models;
using TaskConnect.TaskService.Application.MappingProfile;
using TaskConnect.TaskService.Domain.Common.Interfaces;

var builder = WebApplication.CreateBuilder(args);

var vaultClientFactory = new VaultClientFactory();
var vaultSecretProvider = new VaultSecretProvider(vaultClientFactory);
var databaseConfig = await vaultSecretProvider.GetJsonSecretAsync<DatabaseConfig>("data/databases/tasks");

AddAuthentication(builder);
AddAuthorization(builder);
AddDatabase(builder, databaseConfig);
AddServices(builder);
AddSwagger(builder);
AddHealthChecks(builder);
AddSerilog(builder);

var webApplication = builder.Build();

await ApplyMigrations(webApplication);
ConfigureMiddleware(webApplication);
ConfigureEndpoints(webApplication);

try
{
    Log.Information("Starting up...");
    await webApplication.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application start-up failed");
}
finally
{
    Log.CloseAndFlush();
}

void AddAuthentication(WebApplicationBuilder webApplicationBuilder)
{
    var issuer = webApplicationBuilder.Configuration["AuthSettings:Issuer"];

    webApplicationBuilder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = issuer;
            options.RequireHttpsMetadata = !webApplicationBuilder.Environment.IsDevelopment();
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true
            };
        });
}

void AddAuthorization(WebApplicationBuilder webApplicationBuilder)
{
    webApplicationBuilder.Services.AddAuthorization();
}

void AddDatabase(WebApplicationBuilder webApplicationBuilder, DatabaseConfig config)
{
    var connectionString =
        $"Host={config.Host};Port={config.Port};Database={config.Database};Username={config.Username};Password={config.Password}";
    webApplicationBuilder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));
    webApplicationBuilder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
}

void AddServices(WebApplicationBuilder webApplicationBuilder)
{
    webApplicationBuilder.Services.AddAutoMapper(typeof(ProjectMappingProfile).Assembly);
    webApplicationBuilder.Services.AddScoped<IUserContextService, UserContextService>();
    webApplicationBuilder.Services.AddHttpContextAccessor();
    webApplicationBuilder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetAllTasksQuery).Assembly));
    webApplicationBuilder.Services.AddControllers();
}

void AddSwagger(WebApplicationBuilder webApplicationBuilder)
{
    webApplicationBuilder.Services.AddEndpointsApiExplorer();
    webApplicationBuilder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Task Manager Service API",
            Version = "v1",
            Description = "API for user authentication",
        });

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

void AddHealthChecks(WebApplicationBuilder webApplicationBuilder)
{
    webApplicationBuilder.Services.AddHealthChecks();
}

void AddSerilog(WebApplicationBuilder webApplicationBuilder)
{
    webApplicationBuilder.Host.UseSerilog((context, _, configuration) =>
    {
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .Enrich.FromLogContext();
    });
}

async Task ApplyMigrations(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();
}

void ConfigureMiddleware(WebApplication app)
{
    if (!app.Environment.IsProduction())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Manager Service API v1");
            options.RoutePrefix = "swagger";
        });
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
        opts.GetLevel = (httpContext, _, _) =>
        {
            if (httpContext.Request.Path.StartsWithSegments("/metrics"))
            {
                return LogEventLevel.Verbose;
            }
            return LogEventLevel.Information;
        };
    });

    app.UseRouting();
    app.UseAuthentication();
    app.UseAuthorization();
}

void ConfigureEndpoints(WebApplication app)
{
    app.MapControllers();
    app.UseHttpMetrics();
    app.MapMetrics();
    app.MapHealthChecks("/health");
}