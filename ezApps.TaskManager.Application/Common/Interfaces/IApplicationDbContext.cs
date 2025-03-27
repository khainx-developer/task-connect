using Microsoft.EntityFrameworkCore;
using ezApps.TaskManager.Domain.Entities;

namespace ezApps.TaskManager.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<TaskItem> Tasks { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}