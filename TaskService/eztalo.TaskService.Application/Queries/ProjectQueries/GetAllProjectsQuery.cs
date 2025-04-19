using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries.ProjectQueries;

public class GetAllProjectsQuery : IRequest<List<ProjectResponseModel>>
{
    public string UserId { get; }

    public bool IsArchived { get; set; }

    public GetAllProjectsQuery(string userId, bool isArchived = false)
    {
        UserId = userId;
        IsArchived = isArchived;
    }
}

public class GetAllProjectsQueryHandler : IRequestHandler<GetAllProjectsQuery, List<ProjectResponseModel>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllProjectsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ProjectResponseModel>> Handle(GetAllProjectsQuery request, CancellationToken cancellationToken)
    {
        var projects = await _context.Projects
            .Where(n => n.UserId == request.UserId && n.IsArchived == request.IsArchived)
            .OrderByDescending(n => n.Title)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<ProjectResponseModel>>(projects);
    }
}