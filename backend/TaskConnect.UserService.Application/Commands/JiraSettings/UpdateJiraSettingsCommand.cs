using MediatR;
using TaskConnect.Infrastructure.Core;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Constants;
using TaskConnect.UserService.Domain.Entities;
using TaskConnect.UserService.Domain.Models;

namespace TaskConnect.UserService.Application.Commands.JiraSettings;

public record UpdateJiraSettingsCommand(string UserId, Guid SettingsId, JiraSettingsModel JiraSettingsModel) : IRequest<bool>;

public class UpdateJiraSettingsCommandHandler(IApplicationDbContext context, IVaultSecretProvider vaultSecretProvider)
    : IRequestHandler<UpdateJiraSettingsCommand, bool>
{
    public async Task<bool> Handle(UpdateJiraSettingsCommand request, CancellationToken cancellationToken)
    {
        var user = context.Users.SingleOrDefault(u => u.Id == request.UserId);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        var setting = context.UserSettings.SingleOrDefault(s => s.Id == request.SettingsId && s.UserId == request.UserId);
        if (setting == null)
        {
            throw new Exception("Settings not found");
        }

        setting.Name = request.JiraSettingsModel.Name;
        setting.UpdatedAt = DateTime.Now;

        await vaultSecretProvider.WriteJsonSecretAsync($"data/user-settings/{user.Id}/{setting.Id}",
            request.JiraSettingsModel);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
} 