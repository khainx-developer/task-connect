using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Infrastructure.Persistence;
using MediatR;
using TaskManager.Application.Commands;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Add Database Connection (Change the connection string)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

// 🔹 Add MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateTaskCommand).Assembly));

var app = builder.Build();
app.MapGet("/", () => "Task Manager API is running!");
app.Run();