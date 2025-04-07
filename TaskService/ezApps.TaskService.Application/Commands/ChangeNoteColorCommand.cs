using ezApps.TaskService.Application.Common.Interfaces;
using MediatR;

namespace ezApps.TaskService.Application.Commands;

public class ChangeNoteColorCommand : IRequest<bool>
{
    public Guid Id { get; }
    public string UserId { get; }
    public string Color { get; set; }

    public ChangeNoteColorCommand(Guid id, string userId, string color)
    {
        Id = id;
        UserId = userId;
        Color = color;
    }
}

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
        if (note == null || note.UserId != request.UserId)
        {
            return false;
        }

        note.Color = request.Color;
        note.UpdatedAt = DateTime.Now.ToUniversalTime();
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}