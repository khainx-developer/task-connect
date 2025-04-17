using eztalo.TaskService.Application.Common.Interfaces;
using MediatR;

namespace eztalo.TaskService.Application.Commands.TaskCommands;

public record StopTaskCommand(Guid WorkLogId, int? PercentCompleteAfter) : IRequest<bool>;

public class StopTaskCommandHandler : IRequestHandler<StopTaskCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public StopTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(StopTaskCommand request, CancellationToken cancellationToken)
    {
        var workLog = await _context.WorkLogs.FindAsync(request.WorkLogId);

        if (workLog == null) throw new Exception("WorkLog not found");

        workLog.ToTime = DateTime.UtcNow;
        workLog.PercentCompleteAfter = request.PercentCompleteAfter;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}