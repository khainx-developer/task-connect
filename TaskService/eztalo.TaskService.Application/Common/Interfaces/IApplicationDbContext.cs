using Microsoft.EntityFrameworkCore;
using eztalo.TaskService.Domain.Entities;
using Task = eztalo.TaskService.Domain.Entities.Task;

namespace eztalo.TaskService.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Task> Tasks { get; }
        DbSet<Note> Notes { get; }
        DbSet<Tag> Tags { get; }
        DbSet<Project> Projects { get; }
        DbSet<WorkLog> WorkLogs { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}