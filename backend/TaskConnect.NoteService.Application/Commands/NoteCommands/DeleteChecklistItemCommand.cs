using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.NoteService.Domain.Common.Interfaces;

namespace TaskConnect.NoteService.Application.Commands.NoteCommands;

public record DeleteChecklistItemCommand(
    Guid NoteId,
    string OwnerId,
    Guid ItemId
) : IRequest<bool>;

public class DeleteChecklistItemHandler : IRequestHandler<DeleteChecklistItemCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteChecklistItemHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.Notes
            .Include(n => n.ChecklistItems)
            .FirstOrDefaultAsync(n => n.Id == request.NoteId && n.OwnerId == request.OwnerId, cancellationToken);

        var item = note?.ChecklistItems.FirstOrDefault(ci => ci.Id == request.ItemId);
        if (item == null)
        {
            return false;
        }

        note.ChecklistItems.Remove(item);
        note.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false; // Handle concurrency if needed
        }
    }
}