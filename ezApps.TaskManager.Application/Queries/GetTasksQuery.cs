using ezApps.TaskManager.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ezApps.TaskManager.Domain.Entities;

namespace ezApps.TaskManager.Application.Queries
{
    public class GetTasksQuery : IRequest<List<TaskItem>> { }

    public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, List<TaskItem>>
    {
        private readonly IApplicationDbContext _context;

        public GetTasksQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TaskItem>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
        {
            return await _context.Tasks.ToListAsync(cancellationToken);
        }
    }
}