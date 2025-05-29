using eztalo.TaskService.Api.Services;
using eztalo.TaskService.Application.Commands;
using eztalo.TaskService.Application.Commands.NoteCommands;
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
    public async Task<ActionResult<List<TaskResponseModel>>> GetAll(string searchText)
    {
        var query = new GetAllTasksQuery(_contextService.UserId, searchText);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPost(Name = "Create task")]
    public async Task<ActionResult<TaskResponseModel>> Create(TaskCreateModel model)
    {
        var command = new CreateTaskCommand(
            model.Title,
            model.Description,
            model.ProjectId,
            _contextService.UserId);
        var result = await _mediator.Send(command);

        return await Get(result);
    }
    
    [HttpGet("{taskItemId}", Name = "Get task by Id")]
    public async Task<ActionResult<TaskResponseModel>> Get(Guid taskItemId)
    {
        var query = new GetTaskByIdQuery(taskItemId, _contextService.UserId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}