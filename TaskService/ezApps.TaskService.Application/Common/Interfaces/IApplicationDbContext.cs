using Microsoft.EntityFrameworkCore;
using ezApps.TaskService.Domain.Entities;

namespace ezApps.TaskService.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<TaskItem> Tasks { get; }
        DbSet<Note> Notes { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}