using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Entities;

public record GetUserByUidQuery(string Uid) : IRequest<User>;

public class GetUserByUidHandler : IRequestHandler<GetUserByUidQuery, User>
{
    private readonly IApplicationDbContext _context;

    public GetUserByUidHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User> Handle(GetUserByUidQuery request, CancellationToken cancellationToken)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == request.Uid, cancellationToken);
    }
}