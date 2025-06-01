using TaskConnect.TaskService.Application.Commands.NoteCommands;
using TaskConnect.TaskService.Application.Queries.NoteQueries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskConnect.TaskService.Api.Services;
using TaskConnect.TaskService.Domain.Models;

namespace TaskConnect.TaskService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserContextService _contextService;

    public NotesController(IMediator mediator, IUserContextService contextService)
    {
        _mediator = mediator;
        _contextService = contextService;
    }

    [HttpPost(Name = "Create Note")]
    public async Task<ActionResult<NoteResponseModel>> Create([FromBody] NoteCreateUpdateModel updateModel)
    {
        var command = new CreateNoteCommand(
            _contextService.UserId,
            updateModel.Title,
            updateModel.Content,
            updateModel.Type,
            updateModel.ChecklistItems
        );
        var result = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet(Name = "Get all notes")]
    public async Task<ActionResult<List<NoteResponseModel>>> GetAll(bool isArchived = false)
    {
        var query = new GetAllNotesQuery(_contextService.UserId, isArchived);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpGet("{id}", Name = "Get note by Id")]
    public async Task<ActionResult<NoteResponseModel>> GetById(Guid id)
    {
        var query = new GetNoteByIdQuery(id, _contextService.UserId);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpDelete("{id}", Name = "Delete note by Id")]
    public async Task<ActionResult<bool>> Delete(Guid id, bool isHardDelete = false)
    {
        var command = new DeleteNoteCommand(id, isHardDelete, _contextService.UserId);
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPatch("{id}/recover", Name = "Recover archived note")]
    public async Task<ActionResult<NoteResponseModel>> Recover(Guid id)
    {
        var command = new RecoverNoteCommand(id, _contextService.UserId);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound();
        }

        return await GetById(id);
    }

    [HttpPatch("{id}/pin", Name = "Pin or unpin note")]
    public async Task<ActionResult<NoteResponseModel>> Pin(Guid id, [FromBody] bool pin)
    {
        var command = new PinNoteCommand(id, _contextService.UserId, pin);
        await _mediator.Send(command);

        return await GetById(id);
    }

    [HttpPatch("{id}/color", Name = "Update note color")]
    public async Task<ActionResult<NoteResponseModel>> ChangeColor(Guid id, [FromBody] string color)
    {
        var command = new ChangeNoteColorCommand(id, _contextService.UserId, color);
        await _mediator.Send(command);

        return await GetById(id);
    }

    [HttpPut("{id}", Name = "Update note")]
    public async Task<ActionResult<NoteResponseModel>> Update(Guid id, [FromBody] NoteCreateUpdateModel updateModel)
    {
        var command = new UpdateNoteCommand(
            id,
            _contextService.UserId,
            updateModel.Title,
            updateModel.Content,
            updateModel.Type,
            updateModel.ChecklistItems
        );
        var result = await _mediator.Send(command);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPut(Name = "Update note order")]
    public async Task<IActionResult> UpdateNoteOrder([FromBody] UpdateNoteOrderModel updateModel)
    {
        var command = new UpdateNoteOrderCommand(
            _contextService.UserId,
            updateModel.Order,
            updateModel.Pinned
        );
        await _mediator.Send(command);
        return Ok();
    }

    [HttpPost("{noteId}/checklist", Name = "Update Insert checklist item")]
    public async Task<IActionResult> UpsertChecklistItem(Guid noteId, [FromBody] ChecklistItemModel checklistItem)
    {
        var command = new UpdateInsertChecklistItemCommand(
            noteId,
            _contextService.UserId,
            checklistItem.Id,
            checklistItem.Text,
            checklistItem.IsCompleted,
            checklistItem.Order
        );
        var result = await _mediator.Send(command);

        if (!result)
        {
            return BadRequest("Failed to upsert checklist item.");
        }

        return Ok();
    }

    [HttpDelete("{noteId}/checklist/{itemId}", Name = "Delete checklist item")]
    public async Task<IActionResult> DeleteChecklistItem(
        Guid noteId,
        Guid itemId,
        CancellationToken cancellationToken)
    {
        var command = new DeleteChecklistItemCommand(noteId, _contextService.UserId, itemId);
        var result = await _mediator.Send(command, cancellationToken);

        if (!result)
        {
            return NotFound();
        }

        return Ok();
    }
}