using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries.TaskQueries;

public class GetAllTasksQuery : IRequest<List<TaskResponseModel>>
{
    public string UserId { get; }
    public bool IsArchived { get; set; }
    public DateTime From { get; set; }
    public DateTime To { get; set; }
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
        var projects = await _context.Tasks
            .Where(n => n.UserId == request.UserId && n.IsArchived == request.IsArchived &&
                        n.WorkLogs.Any(wl => wl.FromTime >= request.From && wl.ToTime <= request.To))
            .Include(t => t.Project)
            .Include(t => t.WorkLogs)
            .Include(t => t.Tags)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<TaskResponseModel>>(projects);
    }
}