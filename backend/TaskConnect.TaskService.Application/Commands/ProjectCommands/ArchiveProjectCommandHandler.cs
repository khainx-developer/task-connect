using MediatR;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.ProjectCommands;

public class ArchiveProjectCommandHandler : IRequestHandler<ArchiveProjectCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public ArchiveProjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(ArchiveProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FindAsync(new object[] { request.ProjectId }, cancellationToken);
        if (project == null)
        {
            throw new Exception($"Project with ID {request.ProjectId} not found.");
        }

        if (project.OwnerId != request.UserId)
        {
            throw new Exception("You don't have permission to archive this project.");
        }

        project.IsArchived = true;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return project.Id;
    }
} 