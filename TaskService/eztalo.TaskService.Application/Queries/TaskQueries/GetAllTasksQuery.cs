using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries.TaskQueries;

public class GetAllTasksQuery(string userId, bool isArchived = false, DateTime from = default, DateTime to = default)
    : IRequest<List<TaskResponseModel>>
{
    public string UserId { get; set; } = userId;
    public bool IsArchived { get; set; } = isArchived;
    public DateTime From { get; set; } = from;
    public DateTime To { get; set; } = to;
}

public class GetAllTasksQueryHandler : IRequestHandler<GetAllTasksQuery, List<TaskResponseModel>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllTasksQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TaskResponseModel>> Handle(GetAllTasksQuery request, CancellationToken cancellationToken)
    {
        var projects = await _context.TaskItems
            .Where(n => n.OwnerId == request.UserId && n.IsArchived == request.IsArchived &&
                        n.WorkLogs.Any(wl => wl.FromTime >= request.From && wl.ToTime <= request.To))
            .Include(t => t.Project)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<TaskResponseModel>>(projects);
    }
}