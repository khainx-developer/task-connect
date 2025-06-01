using AutoMapper;
using TaskConnect.TaskService.Domain.Entities;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Application.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.NoteCommands;

public record UpdateNoteCommand(
    Guid Id,
    string OwnerId,
    string Title,
    string Content,
    NoteType Type,
    List<ChecklistItemModel> ChecklistItems
) : IRequest<NoteResponseModel>;

public class UpdateNoteHandler : IRequestHandler<UpdateNoteCommand, NoteResponseModel>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateNoteHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<NoteResponseModel> Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
    {
        // Find the note with its checklist items
        var note = await _context.Notes
            .Include(n => n.ChecklistItems)
            .FirstOrDefaultAsync(n => n.Id == request.Id && n.OwnerId == request.OwnerId, cancellationToken);

        if (note == null)
        {
            return null;
        }

        // Update basic note properties
        note.Title = request.Title;
        note.Type = request.Type;
        note.Content = request.Type == NoteType.Text ? request.Content : string.Empty; // Content used only for Text notes
        note.UpdatedAt = DateTime.UtcNow;

        // Handle checklist items for Checklist notes
        if (request.Type == NoteType.Checklist)
        {
            // Remove items not in the request
            var itemsToRemove = note.ChecklistItems
                .Where(ci => !request.ChecklistItems.Any(rci => rci.Id.HasValue && rci.Id == ci.Id))
                .ToList();
            foreach (var item in itemsToRemove)
            {
                note.ChecklistItems.Remove(item);
            }

            // Update or add items
            foreach (var itemModel in request.ChecklistItems ?? new List<ChecklistItemModel>())
            {
                if (itemModel.Id.HasValue)
                {
                    // Update existing item
                    var existingItem = note.ChecklistItems.FirstOrDefault(ci => ci.Id == itemModel.Id.Value);
                    if (existingItem != null)
                    {
                        existingItem.Text = itemModel.Text;
                        existingItem.IsCompleted = itemModel.IsCompleted;
                        existingItem.Order = itemModel.Order;
                        existingItem.UpdatedAt = DateTime.UtcNow;
                    }
                }
                else
                {
                    // Add new item
                    note.ChecklistItems.Add(new ChecklistItem
                    {
                        Id = Guid.NewGuid(),
                        NoteId = note.Id,
                        Text = itemModel.Text,
                        IsCompleted = itemModel.IsCompleted,
                        Order = itemModel.Order,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }
        else
        {
            // For Text notes, clear checklist items
            note.ChecklistItems.Clear();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<NoteResponseModel>(note);
    }
}