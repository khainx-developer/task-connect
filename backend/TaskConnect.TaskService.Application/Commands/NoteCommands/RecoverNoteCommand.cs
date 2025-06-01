using MediatR;
using TaskConnect.TaskService.Application.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.NoteCommands;

public class RecoverNoteCommand(Guid noteId, string ownerId) : IRequest<bool>
{
    public Guid NoteId { get; } = noteId;
    public string OwnerId { get; } = ownerId;
}

public class RecoverNoteCommandHandler(IApplicationDbContext context) : IRequestHandler<RecoverNoteCommand, bool>
{
    public async Task<bool> Handle(RecoverNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await context.Notes.FindAsync([request.NoteId], cancellationToken);
        if (note == null || note.OwnerId != request.OwnerId)
        {
            return false;
        }

        note.IsArchived = false;
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}