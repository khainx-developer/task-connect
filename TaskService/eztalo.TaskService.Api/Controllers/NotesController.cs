using eztalo.TaskService.Application.Commands;
using eztalo.TaskService.Application.Queries;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eztalo.TaskService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost(Name = "Create Note")]
    public async Task<ActionResult<NoteResponseModel>> Create([FromBody] NoteCreateUpdateModel updateModel)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new CreateNoteCommand(userId, updateModel.Title, updateModel.Content);
        var result = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet(Name = "Get all notes")]
    public async Task<ActionResult<List<NoteResponseModel>>> GetAll(bool isArchived = false)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var query = new GetAllNotesQuery(userId, isArchived);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpGet("{id}", Name = "Get note by ID")]
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

    [HttpDelete("{id}", Name = "Delete note by ID")]
    public async Task<ActionResult<bool>> Delete(Guid id)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new DeleteNoteCommand(id, userId);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpPatch("{id}/pin", Name = "Pin or unpin note")]
    public async Task<ActionResult<NoteResponseModel>> Pin(Guid id, [FromBody] bool pin)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new PinNoteCommand(id, userId, pin);
        await _mediator.Send(command);

        return await GetById(id);
    }

    [HttpPatch("{id}/color", Name = "Update note color")]
    public async Task<ActionResult<NoteResponseModel>> ChangeColor(Guid id, [FromBody] string color)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new ChangeNoteColorCommand(id, userId, color);
        await _mediator.Send(command);

        return await GetById(id);
    }

    [HttpPut("{id}", Name = "Update note")]
    public async Task<ActionResult<NoteResponseModel>> ChangeColor(Guid id,
        [FromBody] NoteCreateUpdateModel updateModel)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new UpdateNoteCommand(id, userId, updateModel.Title, updateModel.Content);
        await _mediator.Send(command);

        return await GetById(id);
    }

    [HttpPut(Name = "Update note order")]
    public async Task<IActionResult> UpdateNoteOrder(
        [FromBody] UpdateNoteOrderModel updateModel)
    {
        var userId = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new UpdateNoteOrderCommand()
        {
            Order = updateModel.Order, Pinned = updateModel.Pinned
        };
        await _mediator.Send(command);
        return Ok();
    }
}