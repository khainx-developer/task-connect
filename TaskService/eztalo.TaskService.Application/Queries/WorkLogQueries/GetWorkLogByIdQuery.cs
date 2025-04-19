using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries.WorkLogQueries;

public class GetWorkLogByIdQuery : IRequest<WorkLogResponseModel>
{
    public GetWorkLogByIdQuery(Guid workLogId, string userId)
    {
        UserId = userId;
        WorkLogId = workLogId;
    }

    public Guid WorkLogId { get; set; }
    public string UserId { get; set; }
}

public class GetWorkLogQueryHandler : IRequestHandler<GetWorkLogByIdQuery, WorkLogResponseModel>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetWorkLogQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<WorkLogResponseModel> Handle(GetWorkLogByIdQuery request, CancellationToken cancellationToken)
    {
        var projects = await _context.WorkLogs
            .Where(workLog => workLog.TaskItem.OwnerId == request.UserId && workLog.Id == request.WorkLogId)
            .Include(workLog => workLog.TaskItem.Project)
            .FirstOrDefaultAsync(cancellationToken);

        return _mapper.Map<WorkLogResponseModel>(projects);
    }
}