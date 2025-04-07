using MediatR;
using Microsoft.EntityFrameworkCore;
using ezApps.UserService.Application.Common.Interfaces;
using ezApps.UserService.Domain.Entities;

public record GetUserByFirebaseUidQuery(string FirebaseUid) : IRequest<User?>;

public class GetUserByFirebaseUidHandler : IRequestHandler<GetUserByFirebaseUidQuery, User?>
{
    private readonly IApplicationDbContext _context;

    public GetUserByFirebaseUidHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> Handle(GetUserByFirebaseUidQuery request, CancellationToken cancellationToken)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == request.FirebaseUid, cancellationToken);
    }
}