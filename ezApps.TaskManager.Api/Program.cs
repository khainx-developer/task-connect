using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ezApps.TaskManager.Application.Common.Interfaces;
using ezApps.TaskManager.Infrastructure.Persistence;
using MediatR;
using ezApps.TaskManager.Application.Commands;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateTaskCommand).Assembly));

var app = builder.Build();
app.MapGet("/", () => "Task Manager API is running!");
await app.RunAsync();