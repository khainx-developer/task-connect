using TaskConnect.TaskService.Domain.Entities;
using MediatR;
using TaskConnect.TaskService.Application.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.ProjectCommands;

public record CreateProjectCommand(
    string Title,
    string Description,
    string OwnerId
) : IRequest<Guid>;

public class CreateProjectCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateProjectCommand, Guid>
{
    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            OwnerId = request.OwnerId,
            CreatedAt = DateTime.UtcNow
        };

        await context.Projects.AddAsync(project, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return project.Id;
    }
}