using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries.WorkLogQueries;

public class GetAllWorkLogsQuery : IRequest<List<WorkLogResponseModel>>
{
    public string UserId { get; set;}
    public bool IsArchived { get; set; }
    public DateTime From { get; set; }
    public DateTime To { get; set; }
}

public class GetAllWorkLogsQueryHandler : IRequestHandler<GetAllWorkLogsQuery, List<WorkLogResponseModel>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllWorkLogsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<WorkLogResponseModel>> Handle(GetAllWorkLogsQuery request, CancellationToken cancellationToken)
    {
        var projects = await _context.WorkLogs
            .Where(workLog => workLog.TaskItem.OwnerId == request.UserId && workLog.TaskItem.IsArchived == request.IsArchived &&
                        workLog.IsArchived == request.IsArchived &&
                        workLog.FromTime >= request.From && workLog.ToTime <= request.To)
            .Include(workLog=> workLog.TaskItem.Project)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<WorkLogResponseModel>>(projects);
    }
}