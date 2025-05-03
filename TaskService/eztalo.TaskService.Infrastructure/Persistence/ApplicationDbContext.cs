using Microsoft.EntityFrameworkCore;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;

namespace eztalo.TaskService.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<TaskItem> TaskItems { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<WorkLog> WorkLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Note>()
                .HasIndex(n => n.OwnerId)
                .HasDatabaseName("IX_Notes_UserId");

            modelBuilder.Entity<TaskItem>()
                .HasIndex(n => n.OwnerId)
                .HasDatabaseName("IX_TaskItems_UserId");

            modelBuilder.Entity<Project>()
                .HasIndex(n => n.OwnerId)
                .HasDatabaseName("IX_Projects_UserId");
        }
    }
}