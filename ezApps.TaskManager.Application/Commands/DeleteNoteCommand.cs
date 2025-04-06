using ezApps.TaskManager.Application.Common.Interfaces;
using MediatR;

namespace ezApps.TaskManager.Application.Commands;

public class DeleteNoteCommand : IRequest<bool>
{
    public Guid Id { get; }
    public string UserId { get; }

    public DeleteNoteCommand(Guid id, string userId)
    {
        Id = id;
        UserId = userId;
    }
}

public class DeleteNoteCommandHandler : IRequestHandler<DeleteNoteCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteNoteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.Notes.FindAsync([request.Id], cancellationToken);
        if (note == null || note.UserId != request.UserId)
        {
            return false;
        }

        note.IsArchived = true; // Soft delete
        note.UpdatedAt = DateTime.Now.ToUniversalTime();
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}