using eztalo.TaskService.Api.Services;
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
    private readonly IUserContextService _contextService;

    public TasksController(IMediator mediator, IUserContextService contextService)
    {
        _mediator = mediator;
        _contextService = contextService;
    }

    [HttpGet(Name = "Get all tasks")]
    public async Task<ActionResult<List<TaskResponseModel>>> GetAll(DateTime from, DateTime to, bool isArchived = false)
    {
        var query = new GetAllTasksQuery(_contextService.UserId, isArchived, from, to);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}