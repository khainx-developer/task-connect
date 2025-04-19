using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Commands.WorkLogCommands;

public record CreateWorkLogCommand(
    string Title,
    Guid? TaskId,
    Guid? ProjectId,
    DateTime FromDateTime,
    DateTime? ToDateTime,
    List<string> Tags
) : IRequest<Guid>;

public class CreateWorkLogCommandHandler : IRequestHandler<CreateWorkLogCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateWorkLogCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateWorkLogCommand request, CancellationToken cancellationToken)
    {
        // Find existing task if provided
        TaskItem taskItem = null;
        if (request.TaskId.HasValue)
        {
            taskItem = await _context.TaskItems
                .FirstOrDefaultAsync(x => x.Id == request.TaskId.Value, cancellationToken);

            if (taskItem == null)
                throw new Exception($"Task with ID {request.TaskId} not found");
        }
        else
        {
            // Create new task if no TaskId provided
            taskItem = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Tags = request.Tags.Select(t=> new Tag { Name = t }).ToList(),
                CreatedAt = DateTime.UtcNow
            };

            // Attach to project if ProjectId is provided
            if (request.ProjectId.HasValue)
            {
                var project = await _context.Projects
                    .FirstOrDefaultAsync(x => x.Id == request.ProjectId.Value, cancellationToken);

                if (project == null)
                    throw new Exception($"Project with ID {request.ProjectId} not found");

                taskItem.ProjectId = project.Id;
            }

            await _context.TaskItems.AddAsync(taskItem, cancellationToken);
        }

        // Create new worklog for the task
        var workLog = new WorkLog
        {
            Id = Guid.NewGuid(),
            TaskId = taskItem.Id,
            FromTime = request.FromDateTime,
            ToTime = request.ToDateTime,
        };

        await _context.WorkLogs.AddAsync(workLog, cancellationToken);

        // Save all changes
        await _context.SaveChangesAsync(cancellationToken);

        // Return the new worklog ID
        return workLog.Id;
    }
}