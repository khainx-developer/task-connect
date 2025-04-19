using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Commands.WorkLogCommands;

public record CreateWorkLogCommand(
    string Title,
    string UserId,
    Guid? TaskItemId,
    Guid? ProjectId,
    DateTime FromDateTime,
    DateTime? ToDateTime
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
        TaskItem taskItem;
        if (request.TaskItemId.HasValue)
        {
            taskItem = await _context.TaskItems
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
                OwnerId = request.UserId,
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