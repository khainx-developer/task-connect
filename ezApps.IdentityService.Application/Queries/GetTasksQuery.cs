using ezApps.IdentityService.Application.Common.Interfaces;
using ezApps.IdentityService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ezApps.IdentityService.Application.Queries
{
    public class GetTasksQuery : IRequest<List<User>> { }

    public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, List<User>>
    {
        private readonly IApplicationDbContext _context;

        public GetTasksQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
        {
            return await _context.Users.ToListAsync(cancellationToken);
        }
    }
}