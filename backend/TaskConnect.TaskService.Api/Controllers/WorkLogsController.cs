using TaskConnect.TaskService.Application.Commands.WorkLogCommands;
using TaskConnect.TaskService.Application.Queries.WorkLogQueries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskConnect.TaskService.Api.Services;
using TaskConnect.TaskService.Domain.Models;

namespace TaskConnect.TaskService.Api.Controllers;

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
        var query = new GetAllWorkLogsQuery(
            _contextService.UserId,
            isArchived,
            from,
            to);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPost(Name = "Create work log")]
    public async Task<ActionResult<WorkLogResponseModel>> Create(WorkLogCreateUpdateModel model)
    {
        var command = new CreateWorkLogCommand(
            model.Title,
            _contextService.UserId,
            model.TaskItemId,
            model.ProjectId,
            model.FromTime,
            model.ToTime);
        var result = await _mediator.Send(command);

        return await Get(result);
    }

    [HttpPut("{workLogId}", Name = "Update work log")]
    public async Task<ActionResult<WorkLogResponseModel>> Update(Guid workLogId, WorkLogCreateUpdateModel model)
    {
        var command = new UpdateWorkLogCommand(
            workLogId,
            _contextService.UserId,
            model.FromTime,
            model.ToTime);
        var result = await _mediator.Send(command);

        return await Get(result);
    }

    [HttpGet("{workLogId}", Name = "Get work log by Id")]
    public async Task<ActionResult<WorkLogResponseModel>> Get(Guid workLogId)
    {
        var query = new GetWorkLogByIdQuery(workLogId, _contextService.UserId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpGet("summary", Name = "Get work log summary")]
    public async Task<ActionResult<WorkLogSummaryModel>> GetSummary(DateTime? from, DateTime? to)
    {
        var query = new GetWorkLogSummaryQuery(_contextService.UserId, from, to);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}