using eztalo.TaskService.Api.Services;
using eztalo.TaskService.Application.Commands.WorkLogCommands;
using eztalo.TaskService.Application.Queries.WorkLogQueries;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eztalo.TaskService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WorkLogsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserContextService _contextService;

    public WorkLogsController(IMediator mediator, IUserContextService contextService)
    {
        _mediator = mediator;
        _contextService = contextService;
    }

    [HttpGet(Name = "Get all work logs")]
    public async Task<ActionResult<List<WorkLogResponseModel>>> GetAll(DateTime from, DateTime to,
        bool isArchived = false)
    {
        var query = new GetAllWorkLogsQuery
        {
            UserId = _contextService.UserId,
            IsArchived = isArchived,
            From = from,
            To = to
        };
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPost(Name = "Create work log")]
    public async Task<ActionResult<List<WorkLogResponseModel>>> Create(WorkLogCreateUpdateModel model)
    {
        var command = new CreateWorkLogCommand(
            model.Title,
            _contextService.UserId,
            model.TaskItemId,
            model.ProjectId,
            model.FromTime,
            model.ToTime);
        var result = await _mediator.Send(command);

        return Ok(result);
    }

    [HttpGet("{workLogId}", Name = "Get work log by Id")]
    public async Task<ActionResult<WorkLogResponseModel>> Get(Guid workLogId)
    {
        var query = new GetWorkLogByIdQuery(workLogId, _contextService.UserId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}