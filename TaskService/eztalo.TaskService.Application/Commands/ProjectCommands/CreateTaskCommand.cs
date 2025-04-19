using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;
using MediatR;

namespace eztalo.TaskService.Application.Commands.ProjectCommands;

public record CreateProjectCommand(
    string Title,
    string Description,
    string UserId
) : IRequest<Guid>;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateProjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            UserId = request.UserId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Projects.AddAsync(project, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return project.Id;
    }
}