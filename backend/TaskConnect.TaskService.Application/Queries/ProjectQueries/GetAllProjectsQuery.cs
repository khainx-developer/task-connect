using AutoMapper;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Queries.ProjectQueries;

public class GetAllProjectsQuery(string ownerId, string searchText) : IRequest<List<ProjectResponseModel>>
{
    public string OwnerId { get; } = ownerId;

    public string SearchText { get; set; } = searchText;
}

public class GetAllProjectsQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetAllProjectsQuery, List<ProjectResponseModel>>
{
    public async Task<List<ProjectResponseModel>> Handle(GetAllProjectsQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.Projects
            .Where(n => n.OwnerId == request.OwnerId)
            .OrderBy(n => n.Title)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var searchText = request.SearchText.ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(searchText));
        }

        var projects = await query.ToListAsync(cancellationToken);

        return mapper.Map<List<ProjectResponseModel>>(projects);
    }
}