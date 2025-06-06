using MediatR;
using TaskConnect.Infrastructure.Core;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Constants;
using TaskConnect.UserService.Domain.Entities;
using TaskConnect.UserService.Domain.Models;

namespace TaskConnect.UserService.Application.Commands.JiraSettings;

public record CreateJiraSettingsCommand(string UserId, JiraSettingsModel JiraSettingsModel) : IRequest<bool>;

public class CreateJiraSettingsCommandHandler(IApplicationDbContext context, IVaultSecretProvider vaultSecretProvider)
    : IRequestHandler<CreateJiraSettingsCommand, bool>
{
    public async Task<bool> Handle(CreateJiraSettingsCommand request, CancellationToken cancellationToken)
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
            Name = request.JiraSettingsModel.Name,
            Type = UserSettingType.Jira,
            CreatedAt = DateTime.Now.ToUniversalTime()
        };
        context.UserSettings.Add(newSetting);

        await vaultSecretProvider.WriteJsonSecretAsync($"data/user-settings/{user.Id}/{newSetting.Id}",
            request.JiraSettingsModel);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}