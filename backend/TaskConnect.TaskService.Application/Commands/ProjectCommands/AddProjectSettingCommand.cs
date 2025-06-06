using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;
using TaskConnect.TaskService.Domain.Entities;

namespace TaskConnect.TaskService.Application.Commands.ProjectCommands;

public record AddProjectSettingCommand(Guid ProjectId, Guid SettingId, string UserId) : IRequest<bool>;

public class AddProjectSettingCommandHandler(IApplicationDbContext context) : IRequestHandler<AddProjectSettingCommand, bool>
{
    public async Task<bool> Handle(AddProjectSettingCommand request, CancellationToken cancellationToken)
    {
        var project = await context.Projects
            .Include(p => p.ProjectSettings)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && p.OwnerId == request.UserId, cancellationToken);

        if (project == null)
        {
            throw new Exception("Project not found");
        }

        // Check if setting is already associated with the project
        if (project.ProjectSettings.Any(ps => ps.UserSettingId == request.SettingId))
        {
            throw new Exception("Setting is already associated with this project");
        }

        context.ProjectSettings.Add(new ProjectSetting
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            UserSettingId = request.SettingId,
            CreatedAt = DateTime.Now.ToUniversalTime()
        });

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
} 