using Microsoft.EntityFrameworkCore;
using eztalo.TaskService.Domain.Entities;

namespace eztalo.TaskService.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TaskItem> TaskItems { get; set; }
    DbSet<Note> Notes { get; set; }
    DbSet<Project> Projects { get; set; }
    DbSet<WorkLog> WorkLogs { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}