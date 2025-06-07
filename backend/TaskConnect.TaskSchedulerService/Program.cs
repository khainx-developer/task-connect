using System.Threading.Tasks;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using TaskConnect.Infrastructure.Core;
using TaskConnect.Infrastructure.Core.Models;
using TaskConnect.TaskSchedulerService;
using TaskConnect.TaskSchedulerService.Jobs;
using TaskConnect.TaskSchedulerService.Services;
using TaskConnect.TaskService.Domain.Common.Interfaces;
using TaskConnect.TaskService.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add Hangfire services
var vaultClientFactory = new VaultClientFactory();
var vaultSecretProvider = new VaultSecretProvider(vaultClientFactory);
var databaseConfig = await vaultSecretProvider.GetJsonSecretAsync<DatabaseConfig>("data/databases/task_scheduler");

var connectionString =
    $"Host={databaseConfig.Host};Port={databaseConfig.Port};Database={databaseConfig.Database};Username={databaseConfig.Username};Password={databaseConfig.Password}";

builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(connectionString));

await AddUserDatabase(builder);
await AddTaskDatabase(builder);

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
builder.Services.AddHttpClient<DataSyncJob>();
builder.Services.AddScoped<IVaultClientFactory, VaultClientFactory>();
builder.Services.AddScoped<IVaultSecretProvider, VaultSecretProvider>();
builder.Services.AddScoped<IAIService, OllamaAIService>();
builder.Services.AddScoped<DataSyncJob>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (!app.Environment.IsProduction())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

var scheduleConfig = await vaultSecretProvider.GetJsonSecretAsync<ScheduleConfig>("data/schedulers/task_scheduler");
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization =
    [
        new HangfireCustomBasicAuthenticationFilter
        {
            User = scheduleConfig.Username,
            Pass = scheduleConfig.Password
        }
    ],
    DashboardTitle = "TaskConnect Scheduler Dashboard"
});
JobScheduler.ConfigureRecurringJobs();

app.MapGet("/", () => "TaskConnect Scheduler Service is running!");

app.Run();

async Task AddUserDatabase(WebApplicationBuilder webApplicationBuilder)
{
    var userDatabaseConfig = await vaultSecretProvider.GetJsonSecretAsync<DatabaseConfig>("data/databases/users");
    var userConnectionString =
        $"Host={userDatabaseConfig.Host};Port={userDatabaseConfig.Port};Database={userDatabaseConfig.Database};Username={userDatabaseConfig.Username};Password={userDatabaseConfig.Password}";
    webApplicationBuilder.Services.AddDbContext<TaskConnect.UserService.Infrastructure.Persistence.ApplicationDbContext>(options =>
        options.UseNpgsql(userConnectionString));
    webApplicationBuilder.Services.AddScoped<TaskConnect.UserService.Domain.Common.Interfaces.IApplicationDbContext>(provider =>
        provider.GetRequiredService<TaskConnect.UserService.Infrastructure.Persistence.ApplicationDbContext>());
}

async Task AddTaskDatabase(WebApplicationBuilder webApplicationBuilder)
{
    var taskDatabaseConfig = await vaultSecretProvider.GetJsonSecretAsync<DatabaseConfig>("data/databases/tasks");
    var taskConnectionString =
        $"Host={taskDatabaseConfig.Host};Port={taskDatabaseConfig.Port};Database={taskDatabaseConfig.Database};Username={taskDatabaseConfig.Username};Password={taskDatabaseConfig.Password}";
    webApplicationBuilder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(taskConnectionString));
    webApplicationBuilder.Services.AddScoped<IApplicationDbContext>(provider =>
        provider.GetRequiredService<ApplicationDbContext>());
}