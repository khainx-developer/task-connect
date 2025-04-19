using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries.TaskQueries;

public class GetAllTasksQuery(string ownerId, string searchText) : IRequest<List<TaskResponseModel>>
{
    public string OwnerId { get; } = ownerId;
    public string SearchText { get; } = searchText;
}

public class GetAllTasksQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetAllTasksQuery, List<TaskResponseModel>>
{
    public async Task<List<TaskResponseModel>> Handle(GetAllTasksQuery request, CancellationToken cancellationToken)
    {
        var query = context.TaskItems
            .Where(n => n.OwnerId == request.OwnerId)
            .Include(t => t.Project)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var searchText = request.SearchText.ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(searchText));
        }

        var tasks = await query.ToListAsync(cancellationToken);

        return mapper.Map<List<TaskResponseModel>>(tasks);
    }
}