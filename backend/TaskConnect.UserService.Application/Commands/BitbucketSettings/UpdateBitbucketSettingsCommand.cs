using MediatR;
using TaskConnect.Infrastructure.Core;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Constants;
using TaskConnect.UserService.Domain.Entities;
using TaskConnect.UserService.Domain.Models;

namespace TaskConnect.UserService.Application.Commands.BitbucketSettings;

public record UpdateBitbucketSettingsCommand(
    string UserId,
    Guid SettingsId,
    BitbucketOrgSettingsModel BitbucketSettingsModel) : IRequest<bool>;

public class UpdateBitbucketSettingsCommandHandler(
    IApplicationDbContext context,
    IVaultSecretProvider vaultSecretProvider)
    : IRequestHandler<UpdateBitbucketSettingsCommand, bool>
{
    public async Task<bool> Handle(UpdateBitbucketSettingsCommand request, CancellationToken cancellationToken)
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

        setting.Name = request.BitbucketSettingsModel.Name;
        setting.UpdatedAt = DateTime.Now.ToUniversalTime();
        var secret = await vaultSecretProvider.GetJsonSecretAsync<BitbucketOrgSettingsModel>(
            $"data/user-settings/{user.Id}/{setting.Id}");
        if (secret != null)
        {
            secret.Name = request.BitbucketSettingsModel.Name;
            secret.RepositorySlug = request.BitbucketSettingsModel.RepositorySlug;
            secret.Username = request.BitbucketSettingsModel.Username;
            secret.DefaultAuthor = request.BitbucketSettingsModel.DefaultAuthor;
            secret.Workspace = request.BitbucketSettingsModel.Workspace;
            if (!string.IsNullOrEmpty(request.BitbucketSettingsModel.AppPassword))
            {
                secret.AppPassword = request.BitbucketSettingsModel.AppPassword;
            }

            await vaultSecretProvider.WriteJsonSecretAsync($"data/user-settings/{user.Id}/{setting.Id}",
                secret);
        }

        await vaultSecretProvider.WriteJsonSecretAsync($"data/user-settings/{user.Id}/{setting.Id}",
            request.BitbucketSettingsModel);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}