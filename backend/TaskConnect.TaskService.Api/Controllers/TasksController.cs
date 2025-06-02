using TaskConnect.TaskService.Application.Queries.TaskQueries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskConnect.TaskService.Api.Services;
using TaskConnect.TaskService.Domain.Models;
using CreateTaskCommand = TaskConnect.TaskService.Application.Commands.TaskCommands.CreateTaskCommand;

namespace TaskConnect.TaskService.Api.Controllers;

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