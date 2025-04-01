using MediatR;
using ezApps.IdentityService.Application.Common.Interfaces;
using ezApps.IdentityService.Domain.Entities;

public record CreateUserCommand(string FirebaseUid, string Email, string Name) : IRequest<User>;

public class CreateUserHandler : IRequestHandler<CreateUserCommand, User>
{
    private readonly IApplicationDbContext _context;

    public CreateUserHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Id = request.FirebaseUid,
            Email = request.Email,
            DisplayName = request.Name,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);
        return user;
    }
}