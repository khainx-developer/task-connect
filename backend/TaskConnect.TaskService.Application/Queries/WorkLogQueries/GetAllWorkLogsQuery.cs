using AutoMapper;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Queries.WorkLogQueries;

public class GetAllWorkLogsQuery(
    string ownerId,
    bool isArchived = false,
    DateTime from = default,
    DateTime to = default)
    : IRequest<List<WorkLogResponseModel>>
{
    public string OwnerId { get; set; } = ownerId;
    public bool IsArchived { get; set; } = isArchived;
    public DateTime From { get; set; } = from.ToUniversalTime();
    public DateTime To { get; set; } = to.ToUniversalTime();
}

public class GetAllWorkLogsQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetAllWorkLogsQuery, List<WorkLogResponseModel>>
{
    public async Task<List<WorkLogResponseModel>> Handle(GetAllWorkLogsQuery request,
        CancellationToken cancellationToken)
    {
        var projects = await context.WorkLogs
            .Where(workLog => workLog.TaskItem.OwnerId == request.OwnerId &&
                              workLog.TaskItem.IsArchived == request.IsArchived &&
                              workLog.FromTime >= request.From &&
                              workLog.ToTime <= request.To)
            .Include(workLog => workLog.TaskItem.Project)
            .ToListAsync(cancellationToken);

        return mapper.Map<List<WorkLogResponseModel>>(projects);
    }
}