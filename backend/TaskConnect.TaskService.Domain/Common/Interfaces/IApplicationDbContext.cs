using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Entities;

namespace TaskConnect.TaskService.Domain.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TaskItem> TaskItems { get; set; }
    DbSet<Project> Projects { get; set; }
    DbSet<ProjectSetting> ProjectSettings { get; set; }
    DbSet<WorkLog> WorkLogs { get; set; }
    DbSet<Mindmap> Mindmaps { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}