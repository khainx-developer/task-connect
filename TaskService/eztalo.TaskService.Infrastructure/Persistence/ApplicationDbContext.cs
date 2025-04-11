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

        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Note> Notes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Note>()
                .HasIndex(n => n.UserId) // Adds an index on UserId
                .HasDatabaseName("IX_Notes_UserId"); // Optional: gives the index a custom name
        }
    }
}