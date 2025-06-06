using MediatR;
using TaskConnect.NoteService.Domain.Common.Interfaces;

namespace TaskConnect.NoteService.Application.Commands.NoteCommands;

public class DeleteNoteCommand(Guid id, bool isHardDelete, string ownerId) : IRequest<bool>
{
    public Guid Id { get; } = id;
    public bool IsHardDelete { get; } = isHardDelete;
    public string OwnerId { get; } = ownerId;
}

public class DeleteNoteCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteNoteCommand, bool>
{
    public async Task<bool> Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await context.Notes.FindAsync([request.Id], cancellationToken);
        if (note == null || note.OwnerId != request.OwnerId)
        {
            return false;
        }

        if (request.IsHardDelete)
        {
            context.Notes.Remove(note);
        }
        else
        {
            note.IsArchived = true; // Soft delete
            note.UpdatedAt = DateTime.Now.ToUniversalTime();
        }

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}