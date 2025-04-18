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

    public ProjectsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet(Name = "Get all projects")]
    public async Task<ActionResult<List<ProjectResponseModel>>> GetAll(bool isArchived = false)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var query = new GetAllProjectsQuery(userId, isArchived);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}