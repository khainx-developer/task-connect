using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using TaskConnect.Infrastructure.Core;
using TaskConnect.Infrastructure.Core.Models;
using TaskConnect.TaskSchedulerService;

var builder = WebApplication.CreateBuilder(args);

// Add Hangfire services
var vaultClientFactory = new VaultClientFactory();
var vaultSecretProvider = new VaultSecretProvider(vaultClientFactory);
var databaseConfig = await vaultSecretProvider.GetJsonSecretAsync<DatabaseConfig>("data/databases/task_scheduler");

var connectionString = $"Host={databaseConfig.Host};Port={databaseConfig.Port};Database={databaseConfig.Database};Username={databaseConfig.Username};Password={databaseConfig.Password}";

builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(connectionString));

// Add the processing server as IHostedService
builder.Services.AddHangfireServer();

// Add authentication
var issuer = builder.Configuration["AuthSettings:Issuer"];
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = issuer;
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline
if (!app.Environment.IsProduction())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// Configure Hangfire dashboard
var hangfireUsername = builder.Configuration["Hangfire:Username"];
var hangfirePassword = builder.Configuration["Hangfire:Password"];

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[]
    {
        new HangfireCustomBasicAuthenticationFilter
        {
            User = hangfireUsername,
            Pass = hangfirePassword
        }
    },
    DashboardTitle = "TaskConnect Scheduler Dashboard"
});

app.MapGet("/", () => "TaskConnect Scheduler Service is running!");

app.Run();