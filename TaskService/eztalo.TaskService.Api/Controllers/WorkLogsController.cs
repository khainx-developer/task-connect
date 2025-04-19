using eztalo.TaskService.Api.Services;
using eztalo.TaskService.Application.Queries.TaskQueries;
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

    [HttpGet(Name = "Get all WorkLogs")]
    public async Task<ActionResult<List<WorkLogResponseModel>>> GetAll(DateTime from, DateTime to, bool isArchived = false)
    {
        if (string.IsNullOrEmpty(_contextService.UserId))
            return Unauthorized();
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
}