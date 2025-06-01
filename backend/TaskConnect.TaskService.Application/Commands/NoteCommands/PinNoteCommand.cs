using MediatR;
using TaskConnect.TaskService.Application.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.NoteCommands;

public class PinNoteCommand(Guid id, string ownerId, bool pinned) : IRequest<bool>
{
    public Guid Id { get; set; } = id;
    public string OwnerId { get; set; } = ownerId;
    public bool Pinned { get; set; } = pinned;
}

public class PinNoteCommandHandler(IApplicationDbContext context) : IRequestHandler<PinNoteCommand, bool>
{
    public async Task<bool> Handle(PinNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await context.Notes.FindAsync([request.Id], cancellationToken);
        if (note == null || note.OwnerId != request.OwnerId)
        {
            return false;
        }

        note.Pinned = request.Pinned;
        note.UpdatedAt = DateTime.Now.ToUniversalTime();
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}