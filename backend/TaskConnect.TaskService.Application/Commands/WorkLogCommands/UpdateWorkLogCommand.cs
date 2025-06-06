using TaskConnect.TaskService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.WorkLogCommands;

public record UpdateWorkLogCommand(
    Guid Id,
    string OwnerId,
    DateTime FromTime,
    DateTime? ToTime,
    string Title = null
) : IRequest<Guid>;

public class UpdateWorkLogCommandHandler : IRequestHandler<UpdateWorkLogCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public UpdateWorkLogCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(UpdateWorkLogCommand request, CancellationToken cancellationToken)
    {
        var workLog = await _context.WorkLogs
            .Include(w => w.TaskItem)
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        if (workLog == null)
        {
            throw new Exception($"WorkLog with ID {request.Id} not found.");
        }

        // Verify ownership through the task
        if (workLog.TaskItem.OwnerId != request.OwnerId)
        {
            throw new Exception("You don't have permission to update this work log.");
        }

        // Update the time fields
        workLog.FromTime = request.FromTime.ToUniversalTime();
        workLog.ToTime = request.ToTime?.ToUniversalTime();

        // Update task title if provided
        if (!string.IsNullOrEmpty(request.Title))
        {
            workLog.TaskItem.Title = request.Title;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return workLog.Id;
    }
} 