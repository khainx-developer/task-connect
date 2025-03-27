using Microsoft.EntityFrameworkCore;
using ezApps.TaskManager.Application.Common.Interfaces;
using ezApps.TaskManager.Domain.Entities;

namespace ezApps.TaskManager.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<TaskItem> Tasks { get; set; }
    }
}