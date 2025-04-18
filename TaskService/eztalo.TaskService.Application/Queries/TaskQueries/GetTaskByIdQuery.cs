using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Task = eztalo.TaskService.Domain.Entities.Task;

namespace eztalo.TaskService.Application.Queries.TaskQueries;

public record GetTaskByIdQuery(Guid Id) : IRequest<Task>;

public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, Task>
{
    private readonly IApplicationDbContext _context;

    public GetTaskByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Task> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.WorkLogs)
            .Include(t => t.Tags)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
    }
}