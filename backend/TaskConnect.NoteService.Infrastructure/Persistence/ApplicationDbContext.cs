using Microsoft.EntityFrameworkCore;
using TaskConnect.NoteService.Domain.Common.Interfaces;
using TaskConnect.NoteService.Domain.Entities;

namespace TaskConnect.NoteService.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Note> Notes { get; set; }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Note>()
                .HasIndex(n => n.OwnerId)
                .HasDatabaseName("IX_Notes_UserId");
        }
    }
}