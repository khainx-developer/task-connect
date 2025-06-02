using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.NoteService.Application.Common.Interfaces;
using TaskConnect.NoteService.Domain.Entities;

namespace TaskConnect.NoteService.Application.Commands.NoteCommands;

public record UpdateInsertChecklistItemCommand(
    Guid NoteId,
    string OwnerId,
    Guid? ChecklistItemId, // Null for creating a new item, non-null for updating an existing item
    string Text,
    bool IsCompleted,
    int Order
) : IRequest<bool>;

public class UpsertChecklistItemCommandHandler : IRequestHandler<UpdateInsertChecklistItemCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpsertChecklistItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateInsertChecklistItemCommand request, CancellationToken cancellationToken)
    {
        // Find the note and verify ownership and type
        var note = await _context.Notes
            .Include(n => n.ChecklistItems)
            .FirstOrDefaultAsync(n => n.Id == request.NoteId && n.OwnerId == request.OwnerId, cancellationToken);

        if (note is not { Type: NoteType.Checklist })
        {
            return false; // Note not found, not owned by user, or not a checklist note
        }

        if (request.ChecklistItemId.HasValue)
        {
            // Update existing checklist item
            var checklistItem = note.ChecklistItems
                .FirstOrDefault(ci => ci.Id == request.ChecklistItemId.Value);

            if (checklistItem == null)
            {
                return false; // Checklist item not found
            }

            checklistItem.Text = request.Text;
            checklistItem.IsCompleted = request.IsCompleted;
            checklistItem.Order = request.Order;
            checklistItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new checklist item
            var checklistItem = new ChecklistItem
            {
                Id = Guid.NewGuid(),
                NoteId = request.NoteId,
                Text = request.Text,
                IsCompleted = request.IsCompleted,
                Order = request.Order,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChecklistItems.Add(checklistItem);
        }

        note.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}