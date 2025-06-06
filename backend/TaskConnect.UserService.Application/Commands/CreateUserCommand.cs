using MediatR;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Entities;

public record CreateUserCommand(string Uid, string Email, string Name) : IRequest<User>;

public class CreateUserHandler(IApplicationDbContext context) : IRequestHandler<CreateUserCommand, User>
{
    public async Task<User> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Id = request.Uid,
            Email = request.Email,
            DisplayName = request.Name,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync(cancellationToken);
        return user;
    }
}