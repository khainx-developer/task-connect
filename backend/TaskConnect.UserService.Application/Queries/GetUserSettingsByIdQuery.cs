using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.Infrastructure.Core;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Constants;
using TaskConnect.UserService.Domain.Models;

namespace TaskConnect.UserService.Application.Queries;

public record GetUserSettingsByIdQuery(string UserId, Guid SettingsId) : IRequest<UserSettingsDetailModel>;

public class GetUserSettingsByIdQueryHandler : IRequestHandler<GetUserSettingsByIdQuery, UserSettingsDetailModel>
{
    private readonly IApplicationDbContext _context;
    private readonly IVaultSecretProvider _vaultSecretProvider;

    public GetUserSettingsByIdQueryHandler(IApplicationDbContext context, IVaultSecretProvider vaultSecretProvider)
    {
        _context = context;
        _vaultSecretProvider = vaultSecretProvider;
    }

    public async Task<UserSettingsDetailModel> Handle(GetUserSettingsByIdQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.UserSettings
            .FirstOrDefaultAsync(s => s.Id == request.SettingsId && s.UserId == request.UserId, cancellationToken);

        if (setting == null)
        {
            throw new Exception("Setting not found");
        }

        var result = new UserSettingsDetailModel
        {
            SettingId = setting.Id,
            SettingName = setting.Name,
            SettingTypeId = setting.Type,
            SettingTypeName = setting.Type.ToString(),
            CreatedAt = setting.CreatedAt,
            UpdatedAt = setting.UpdatedAt
        };

        // Fetch and populate type-specific settings from vault
        switch (setting.Type)
        {
            case UserSettingType.Jira:
                var jiraSettings = await _vaultSecretProvider.GetJsonSecretAsync<JiraSettingsModel>(
                    $"data/user-settings/{request.UserId}/{request.SettingsId}");
                if (jiraSettings != null)
                {
                    result.AtlassianEmailAddress = jiraSettings.AtlassianEmailAddress;
                    result.JiraCloudDomain = jiraSettings.JiraCloudDomain;
                }
                break;

            case UserSettingType.BitbucketOrg:
                var bitbucketSettings = await _vaultSecretProvider.GetJsonSecretAsync<BitbucketOrgSettingsModel>(
                    $"data/user-settings/{request.UserId}/{request.SettingsId}");
                if (bitbucketSettings != null)
                {
                    result.Username = bitbucketSettings.Username;
                    result.Workspace = bitbucketSettings.Workspace;
                    result.RepositorySlug = bitbucketSettings.RepositorySlug;
                }
                break;
        }

        return result;
    }
}