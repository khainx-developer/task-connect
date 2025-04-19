using eztalo.TaskService.Api.Services;
using eztalo.TaskService.Application.Commands;
using eztalo.TaskService.Application.Commands.NoteCommands;
using eztalo.TaskService.Application.Queries;
using eztalo.TaskService.Application.Queries.NoteQueries;
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
    private readonly IUserContextService _contextService;

    public NotesController(IMediator mediator, IUserContextService contextService)
    {
        _mediator = mediator;
        _contextService = contextService;
    }

    [HttpPost(Name = "Create Note")]
    public async Task<ActionResult<NoteResponseModel>> Create([FromBody] NoteCreateUpdateModel updateModel)
    {
        var command = new CreateNoteCommand(_contextService.UserId, updateModel.Title, updateModel.Content);
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
    public async Task<ActionResult<bool>> Delete(Guid id)
    {
        var command = new DeleteNoteCommand(id, _contextService.UserId);
        await _mediator.Send(command);

        return NoContent();
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
    public async Task<ActionResult<NoteResponseModel>> ChangeColor(Guid id,
        [FromBody] NoteCreateUpdateModel updateModel)
    {
        var command = new UpdateNoteCommand(id, _contextService.UserId, updateModel.Title, updateModel.Content);
        await _mediator.Send(command);

        return await GetById(id);
    }

    [HttpPut(Name = "Update note order")]
    public async Task<IActionResult> UpdateNoteOrder(
        [FromBody] UpdateNoteOrderModel updateModel)
    {
        var command = new UpdateNoteOrderCommand(
            _contextService.UserId,
            updateModel.Order,
            updateModel.Pinned
        );
        await _mediator.Send(command);
        return Ok();
    }
}