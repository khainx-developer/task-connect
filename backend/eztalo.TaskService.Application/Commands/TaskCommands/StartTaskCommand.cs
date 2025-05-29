using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;
using MediatR;

namespace eztalo.TaskService.Application.Queries.TaskQueries;

public record StartTaskCommand(Guid TaskId) : IRequest<Guid>;

public class StartTaskCommandHandler : IRequestHandler<StartTaskCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public StartTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(StartTaskCommand request, CancellationToken cancellationToken)
    {
        var workLog = new WorkLog
        {
            Id = Guid.NewGuid(),
            TaskItemId = request.TaskId,
            FromTime = DateTime.UtcNow
        };

        _context.WorkLogs.Add(workLog);
        await _context.SaveChangesAsync(cancellationToken);

        return workLog.Id;
    }
}