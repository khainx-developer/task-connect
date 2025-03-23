using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Queries
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