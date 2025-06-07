using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskConnect.Api.Core.Services;
using TaskConnect.UserService.Api.ViewModels;
using TaskConnect.UserService.Application.Commands.BitbucketSettings;
using TaskConnect.UserService.Application.Commands.JiraSettings;
using TaskConnect.UserService.Application.Queries;
using TaskConnect.UserService.Domain.Models;

namespace TaskConnect.UserService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/user-settings")]
public class UserSettingsController(IMediator mediator, IUserContextService userContextService) : ControllerBase
{
    [Authorize]
    [HttpGet(Name = "Get User Settings")]
    public async Task<ActionResult<List<UserSettingsModel>>> GetUserSettings()
    {
        var settings = await mediator.Send(new GetUserSettingsQuery(userContextService.UserId));
        return Ok(settings);
    }

    [Authorize]
    [HttpGet("{settingsId}", Name = "Get User Settings by Id")]
    public async Task<ActionResult<UserSettingsDetailModel>> GetUserSettingsById(Guid settingsId)
    {
        var settings = await mediator.Send(new GetUserSettingsByIdQuery(userContextService.UserId, settingsId));
        return Ok(settings);
    }

    [Authorize]
    [HttpPost("jira", Name = "Create Jira Settings")]
    public async Task<ActionResult> CreateJiraSettings(JiraSettingsViewModel model)
    {
        var newId = await mediator.Send(new CreateJiraSettingsCommand(userContextService.UserId,
            new JiraSettingsModel
            {
                Name = model.Name,
                ApiToken = model.ApiToken,
                AtlassianEmailAddress = model.AtlassianEmailAddress,
                JiraCloudDomain = model.JiraCloudDomain
            }));
        var settings = await mediator.Send(new GetUserSettingsByIdQuery(userContextService.UserId, newId));
        return Ok(settings);
    }

    [Authorize]
    [HttpPut("jira/{settingsId}", Name = "Update Jira Settings")]
    public async Task<ActionResult> UpdateJiraSettings(Guid settingsId, JiraSettingsViewModel model)
    {
        await mediator.Send(new UpdateJiraSettingsCommand(userContextService.UserId, settingsId,
            new JiraSettingsModel
            {
                Name = model.Name,
                ApiToken = model.ApiToken,
                AtlassianEmailAddress = model.AtlassianEmailAddress,
                JiraCloudDomain = model.JiraCloudDomain
            }));
        return Ok();
    }

    [Authorize]
    [HttpPost("bitbucket", Name = "Create Bitbucket Settings")]
    public async Task<ActionResult<UserSettingsDetailModel>> CreateBitbucketSettings(BitbucketSettingsViewModel model)
    {
        var newId = await mediator.Send(new CreateBitbucketSettingsCommand(userContextService.UserId,
            new BitbucketOrgSettingsModel
            {
                Name = model.Name,
                Username = model.Username,
                AppPassword = model.AppPassword,
                Workspace = model.Workspace,
                RepositorySlug = model.RepositorySlug,
                DefaultAuthor = model.DefaultAuthor
            }));
        var settings = await mediator.Send(new GetUserSettingsByIdQuery(userContextService.UserId, newId));
        return Ok(settings);
    }

    [Authorize]
    [HttpPut("bitbucket/{settingsId}", Name = "Update Bitbucket Settings")]
    public async Task<ActionResult> UpdateBitbucketSettings(Guid settingsId, BitbucketSettingsViewModel model)
    {
        await mediator.Send(new UpdateBitbucketSettingsCommand(userContextService.UserId, settingsId,
            new BitbucketOrgSettingsModel
            {
                Name = model.Name,
                Username = model.Username,
                AppPassword = model.AppPassword,
                Workspace = model.Workspace,
                RepositorySlug = model.RepositorySlug,
                DefaultAuthor = model.DefaultAuthor
            }));
        return Ok();
    }
}