using eztalo.TaskService.Application.Queries.TaskQueries;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eztalo.TaskService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet(Name = "Get all tasks")]
    public async Task<ActionResult<List<TaskResponseModel>>> GetAll(DateTime from, DateTime to, bool isArchived = false)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var query = new GetAllTasksQuery
        {
            IsArchived = isArchived,
            From = from,
            To = to
        };
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}