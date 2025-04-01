using MediatR;
using Microsoft.EntityFrameworkCore;
using ezApps.IdentityService.Application.Common.Interfaces;
using ezApps.IdentityService.Domain.Entities;

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