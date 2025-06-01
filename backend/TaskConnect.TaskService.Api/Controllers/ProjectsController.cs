using TaskConnect.TaskService.Application.Commands.ProjectCommands;
using TaskConnect.TaskService.Application.Queries.ProjectQueries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskConnect.TaskService.Api.Services;
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
}