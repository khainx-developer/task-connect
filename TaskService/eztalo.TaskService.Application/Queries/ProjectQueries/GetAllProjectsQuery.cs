using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries.ProjectQueries;

public class GetAllProjectsQuery(string ownerId, string searchText) : IRequest<List<ProjectResponseModel>>
{
    public string OwnerId { get; } = ownerId;

    public string SearchText { get; set; } = searchText;
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

    public async Task<List<ProjectResponseModel>> Handle(GetAllProjectsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Projects
            .Where(n => n.OwnerId == request.OwnerId)
            .OrderBy(n => n.Title)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var searchText = request.SearchText.ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(searchText));
        }

        var projects = await query.ToListAsync(cancellationToken);

        return _mapper.Map<List<ProjectResponseModel>>(projects);
    }
}