using eztalo.TaskService.Application.Common.Interfaces;
using MediatR;

namespace eztalo.TaskService.Application.Commands;

public class PinNoteCommand : IRequest<bool>
{
    public Guid Id { get; }
    public string UserId { get; }
    public bool Pinned { get; set; } = false;

    public PinNoteCommand(Guid id, string userId, bool pinned)
    {
        Id = id;
        UserId = userId;
        Pinned = pinned;
    }
}

public class PinNoteCommandHandler : IRequestHandler<PinNoteCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public PinNoteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(PinNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.Notes.FindAsync([request.Id], cancellationToken);
        if (note == null || note.OwnerId != request.UserId)
        {
            return false;
        }

        note.Pinned = request.Pinned;
        note.UpdatedAt = DateTime.Now.ToUniversalTime();
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}