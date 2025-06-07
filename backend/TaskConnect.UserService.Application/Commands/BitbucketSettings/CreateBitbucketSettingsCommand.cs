using MediatR;
using TaskConnect.Infrastructure.Core;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Constants;
using TaskConnect.UserService.Domain.Entities;
using TaskConnect.UserService.Domain.Models;

namespace TaskConnect.UserService.Application.Commands.BitbucketSettings;

public record CreateBitbucketSettingsCommand(string UserId, BitbucketOrgSettingsModel BitbucketSettingsModel) : IRequest<Guid>;

public class CreateBitbucketSettingsCommandHandler(IApplicationDbContext context, IVaultSecretProvider vaultSecretProvider)
    : IRequestHandler<CreateBitbucketSettingsCommand, Guid>
{
    public async Task<Guid> Handle(CreateBitbucketSettingsCommand request, CancellationToken cancellationToken)
    {
        var user = context.Users.SingleOrDefault(u => u.Id == request.UserId);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        var newSetting = new UserSetting
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Name = request.BitbucketSettingsModel.Name,
            Type = UserSettingType.BitbucketOrg,
            CreatedAt = DateTime.Now.ToUniversalTime()
        };
        context.UserSettings.Add(newSetting);

        await vaultSecretProvider.WriteJsonSecretAsync($"data/user-settings/{user.Id}/{newSetting.Id}",
            request.BitbucketSettingsModel);
        await context.SaveChangesAsync(cancellationToken);
        return newSetting.Id;
    }
} 