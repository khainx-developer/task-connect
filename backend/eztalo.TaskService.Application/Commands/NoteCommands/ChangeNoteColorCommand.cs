using eztalo.TaskService.Application.Common.Interfaces;
using MediatR;

namespace eztalo.TaskService.Application.Commands.NoteCommands;

public record ChangeNoteColorCommand(Guid Id, string OwnerId, string Color) : IRequest<bool>;

public class ChangeNoteColorCommandHandler : IRequestHandler<ChangeNoteColorCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ChangeNoteColorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ChangeNoteColorCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.Notes.FindAsync([request.Id], cancellationToken);
        if (note == null || note.OwnerId != request.OwnerId)
        {
            return false;
        }

        note.Color = request.Color;
        note.UpdatedAt = DateTime.Now.ToUniversalTime();
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}