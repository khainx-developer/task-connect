using MediatR;
using TaskConnect.Infrastructure.Core;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Models;

namespace TaskConnect.UserService.Application.Commands.JiraSettings;

public record UpdateJiraSettingsCommand(string UserId, Guid SettingsId, JiraSettingsModel JiraSettingsModel)
    : IRequest<bool>;

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

        var setting =
            context.UserSettings.SingleOrDefault(s => s.Id == request.SettingsId && s.UserId == request.UserId);
        if (setting == null)
        {
            throw new Exception("Settings not found");
        }

        setting.Name = request.JiraSettingsModel.Name;
        setting.UpdatedAt = DateTime.Now.ToUniversalTime();

        var secret = await vaultSecretProvider.GetJsonSecretAsync<JiraSettingsModel>(
                $"data/user-settings/{user.Id}/{setting.Id}");
        if (secret != null)
        {
            secret.AtlassianEmailAddress = request.JiraSettingsModel.AtlassianEmailAddress;
            secret.JiraCloudDomain = request.JiraSettingsModel.JiraCloudDomain;
            secret.Name = request.JiraSettingsModel.Name;
            if (!string.IsNullOrEmpty(request.JiraSettingsModel.ApiToken))
            {
                secret.ApiToken = request.JiraSettingsModel.ApiToken;
            }

            await vaultSecretProvider.WriteJsonSecretAsync($"data/user-settings/{user.Id}/{setting.Id}",
                secret);
        }

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}