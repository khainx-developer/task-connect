using TaskConnect.TaskService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.WorkLogCommands;

public class CreateWorkLogCommand(
    string title,
    string ownerId,
    Guid? taskItemId,
    Guid? projectId,
    DateTime fromDateTime,
    DateTime? toDateTime
) : IRequest<Guid>
{
    public string Title { get; } = title;
    public string OwnerId { get; } = ownerId;
    public Guid? TaskItemId { get; } = taskItemId;
    public Guid? ProjectId { get; } = projectId;
    public DateTime? ToDateTime { get; } = toDateTime?.ToUniversalTime();
    public DateTime FromDateTime { get; init; } = fromDateTime.ToUniversalTime();
}

public class CreateWorkLogCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateWorkLogCommand, Guid>
{
    public async Task<Guid> Handle(CreateWorkLogCommand request, CancellationToken cancellationToken)
    {
        // Find existing task if provided
        TaskItem taskItem;
        if (request.TaskItemId.HasValue)
        {
            taskItem = await context.TaskItems
                .FirstOrDefaultAsync(x => x.Id == request.TaskItemId.Value, cancellationToken);

            if (taskItem == null)
                throw new Exception($"Task with ID {request.TaskItemId} not found");
        }
        else
        {
            // Create new task if no TaskId provided
            taskItem = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                OwnerId = request.OwnerId,
                CreatedAt = DateTime.UtcNow
            };

            // Attach to project if ProjectId is provided
            if (request.ProjectId.HasValue)
            {
                var project = await context.Projects
                    .FirstOrDefaultAsync(x => x.Id == request.ProjectId.Value, cancellationToken);

                if (project == null)
                    throw new Exception($"Project with ID {request.ProjectId} not found");

                taskItem.ProjectId = project.Id;
            }

            await context.TaskItems.AddAsync(taskItem, cancellationToken);
        }

        // Create new worklog for the task
        var workLog = new WorkLog
        {
            Id = Guid.NewGuid(),
            TaskItemId = taskItem.Id,
            FromTime = request.FromDateTime.ToUniversalTime(),
            ToTime = request.ToDateTime?.ToUniversalTime(),
        };

        await context.WorkLogs.AddAsync(workLog, cancellationToken);

        // Save all changes
        await context.SaveChangesAsync(cancellationToken);

        // Return the new worklog ID
        return workLog.Id;
    }
}