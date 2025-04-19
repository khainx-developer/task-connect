using eztalo.TaskService.Application.Common.Interfaces;
using MediatR;

namespace eztalo.TaskService.Application.Commands;

public class DeleteNoteCommand(Guid id, string ownerId) : IRequest<bool>
{
    public Guid Id { get; } = id;
    public string OwnerId { get; } = ownerId;
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
        if (note == null || note.OwnerId != request.OwnerId)
        {
            return false;
        }

        note.IsArchived = true; // Soft delete
        note.UpdatedAt = DateTime.Now.ToUniversalTime();
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}