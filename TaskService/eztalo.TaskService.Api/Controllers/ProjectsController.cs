using eztalo.TaskService.Api.Services;
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
    public async Task<ActionResult<List<ProjectResponseModel>>> GetAll(bool isArchived = false)
    {
        var query = new GetAllProjectsQuery(_contextService.UserId, isArchived);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}