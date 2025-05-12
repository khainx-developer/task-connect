using eztalo.TaskService.Api.Services;
using eztalo.TaskService.Application.Commands.MindmapCommands;
using eztalo.TaskService.Application.Queries.MindmapQueries;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eztalo.TaskService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MindmapsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserContextService _contextService;

    public MindmapsController(IMediator mediator, IUserContextService contextService)
    {
        _mediator = mediator;
        _contextService = contextService;
    }

    [HttpPost(Name = "Create Mindmap")]
    public async Task<ActionResult<MindmapResponseModel>> Create([FromBody] MindmapCreateUpdateModel model)
    {
        var command = new CreateMindmapCommand(
            _contextService.UserId,
            model.Title,
            model.Nodes,
            model.Edges
        );
        var result = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet(Name = "Get all mindmaps")]
    public async Task<ActionResult<List<MindmapResponseModel>>> GetAll(bool isArchived = false)
    {
        var query = new GetAllMindmapsQuery(_contextService.UserId, isArchived);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpGet("{id}", Name = "Get mindmap by Id")]
    public async Task<ActionResult<MindmapResponseModel>> GetById(Guid id)
    {
        var query = new GetMindmapByIdQuery(id, _contextService.UserId);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPut("{id}", Name = "Update mindmap")]
    public async Task<ActionResult<MindmapResponseModel>> Update(Guid id, [FromBody] MindmapCreateUpdateModel model)
    {
        var command = new UpdateMindmapCommand(
            id,
            _contextService.UserId,
            model.Title,
            model.Nodes,
            model.Edges
        );
        var result = await _mediator.Send(command);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpDelete("{id}", Name = "Delete mindmap by Id")]
    public async Task<ActionResult<bool>> Delete(Guid id)
    {
        var command = new DeleteMindmapCommand(id, _contextService.UserId);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
} 