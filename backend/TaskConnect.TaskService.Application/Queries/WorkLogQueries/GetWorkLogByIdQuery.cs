using AutoMapper;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Queries.WorkLogQueries;

public class GetWorkLogByIdQuery(Guid workLogId, string ownerId) : IRequest<WorkLogResponseModel>
{
    public Guid WorkLogId { get; set; } = workLogId;
    public string OwnerId { get; set; } = ownerId;
}

public class GetWorkLogQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetWorkLogByIdQuery, WorkLogResponseModel>
{
    public async Task<WorkLogResponseModel> Handle(GetWorkLogByIdQuery request, CancellationToken cancellationToken)
    {
        var workLog = await context.WorkLogs
            .Where(workLog => workLog.TaskItem.OwnerId == request.OwnerId && workLog.Id == request.WorkLogId)
            .Include(workLog => workLog.TaskItem.Project)
            .FirstOrDefaultAsync(cancellationToken);

        return mapper.Map<WorkLogResponseModel>(workLog);
    }
}