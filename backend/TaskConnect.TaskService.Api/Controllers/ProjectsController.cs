using TaskConnect.TaskService.Application.Commands.ProjectCommands;
using TaskConnect.TaskService.Application.Queries.ProjectQueries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskConnect.Api.Core.Services;
using TaskConnect.TaskService.Domain.Models;

namespace TaskConnect.TaskService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserContextService _contextService;

    public ProjectsController(IMediator mediator, IUserContextService contextService)
    {
        _mediator = mediator;
        _contextService = contextService;
    }

    [HttpGet(Name = "Get all projects")]
    public async Task<ActionResult<List<ProjectResponseModel>>> GetAll(string searchText)
    {
        var query = new GetAllProjectsQuery(_contextService.UserId, searchText);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPost(Name = "Create project")]
    public async Task<ActionResult<ProjectResponseModel>> Create(ProjectCreateModel model)
    {
        var command = new CreateProjectCommand(
            model.Title,
            model.Description,
            _contextService.UserId);
        var result = await _mediator.Send(command);

        return await Get(result);
    }
    
    [HttpGet("{projectId}", Name = "Get project by Id")]
    public async Task<ActionResult<ProjectResponseModel>> Get(Guid projectId)
    {
        var query = new GetProjectByIdQuery(projectId, _contextService.UserId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPut("{projectId}", Name = "Update project")]
    public async Task<ActionResult<ProjectResponseModel>> Update(Guid projectId, ProjectCreateModel model)
    {
        var command = new UpdateProjectCommand(
            projectId,
            model.Title,
            model.Description,
            _contextService.UserId);
        var result = await _mediator.Send(command);

        return await Get(result);
    }

    [HttpPut("{projectId}/archive", Name = "Archive project")]
    public async Task<ActionResult<ProjectResponseModel>> Archive(Guid projectId)
    {
        var command = new ArchiveProjectCommand(projectId, _contextService.UserId);
        var result = await _mediator.Send(command);

        return await Get(result);
    }

    [HttpPost("{projectId}/settings/{settingId}", Name = "Add setting to project")]
    public async Task<ActionResult> AddSetting(Guid projectId, Guid settingId)
    {
        await _mediator.Send(new AddProjectSettingCommand(projectId, settingId, _contextService.UserId));
        return Ok();
    }
}