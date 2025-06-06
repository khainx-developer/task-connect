using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.ProjectCommands;

public record RemoveProjectSettingCommand(Guid ProjectId, Guid SettingId, string UserId) : IRequest;

public class RemoveProjectSettingCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RemoveProjectSettingCommand>
{
    public async Task Handle(RemoveProjectSettingCommand request, CancellationToken cancellationToken)
    {
        var projectSetting = await context.ProjectSettings
            .FirstOrDefaultAsync(x => 
                x.ProjectId == request.ProjectId && 
                x.UserSettingId == request.SettingId &&
                x.Project.OwnerId == request.UserId,
                cancellationToken);

        if (projectSetting == null)
        {
            throw new Exception("Project setting not found or you don't have permission to remove it");
        }

        context.ProjectSettings.Remove(projectSetting);
        await context.SaveChangesAsync(cancellationToken);
    }
} 