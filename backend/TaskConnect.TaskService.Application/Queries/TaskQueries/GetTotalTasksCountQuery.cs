using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Queries.TaskQueries;

public record GetTotalTasksCountQuery(
    string OwnerId
) : IRequest<int>;

public class GetTotalTasksCountQueryHandler : IRequestHandler<GetTotalTasksCountQuery, int>
{
    private readonly IApplicationDbContext _context;

    public GetTotalTasksCountQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(GetTotalTasksCountQuery request, CancellationToken cancellationToken)
    {
        var totalCount = await _context.TaskItems
            .CountAsync(t => t.OwnerId == request.OwnerId, cancellationToken);

        return totalCount;
    }
} 