using AutoMapper;
using ezApps.TaskManager.Application.Commands;
using ezApps.TaskManager.Application.Common;
using ezApps.TaskManager.Application.Queries;
using ezApps.TaskManager.Domain.Entities;
using ezApps.TaskManager.Domain.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ezApps.TaskManager.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NoteController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly IMediator _mediator;

    public NoteController(IMapper mapper, IMediator mediator)
    {
        _mapper = mapper;
        _mediator = mediator;
    }

    // Create Note
    [HttpPost]
    public async Task<ActionResult<NoteResponseModel>> Create([FromBody] NoteCreateModel model)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new CreateNoteCommand(userId, model.Title, model.Content, model.Pinned);
        var result = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // Get all notes for the logged-in user
    [HttpGet]
    public async Task<ActionResult<List<NoteResponseModel>>> GetAll()
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var query = new GetAllNotesQuery(userId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    // Get note by ID
    [HttpGet("{id}")]
    public async Task<ActionResult<NoteResponseModel>> GetById(Guid id)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var query = new GetNoteByIdQuery(id, userId);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }
}