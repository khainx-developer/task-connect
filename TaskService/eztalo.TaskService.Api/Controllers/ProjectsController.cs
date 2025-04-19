using eztalo.TaskService.Api.Services;
using eztalo.TaskService.Application.Commands.ProjectCommands;
using eztalo.TaskService.Application.Queries.ProjectQueries;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eztalo.TaskService.Api.Controllers;

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