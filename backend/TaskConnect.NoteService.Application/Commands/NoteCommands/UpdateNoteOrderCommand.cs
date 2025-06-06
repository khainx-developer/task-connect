using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.NoteService.Domain.Common.Interfaces;

namespace TaskConnect.NoteService.Application.Commands.NoteCommands;

public class UpdateNoteOrderCommand : IRequest<bool>
{
    public UpdateNoteOrderCommand(string ownerId, List<Guid> order, bool pinned)
    {
        OwnerId = ownerId;
        Order = order;
        Pinned = pinned;
    }

    public List<Guid> Order { get; set; }
    public bool Pinned { get; set; }
    public string OwnerId { get; set; }
}

public class UpdateNoteOrderHandler : IRequestHandler<UpdateNoteOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateNoteOrderHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(UpdateNoteOrderCommand request, CancellationToken cancellationToken)
    {
        // Validate that Order is not null or empty
        if (request.Order == null || !request.Order.Any())
        {
            return false;
        }

        // Retrieve notes with matching Pinned status and IDs in the Order list
        var notes = await _context.Notes
            .Where(n => n.OwnerId == request.OwnerId && n.Pinned == request.Pinned && request.Order.Contains(n.Id))
            .ToListAsync(cancellationToken);

        // Validate that all provided IDs exist in the retrieved notes
        if (notes.Count != request.Order.Count || request.Order.Except(notes.Select(n => n.Id)).Any())
        {
            return false; // Invalid or missing note IDs
        }

        // Update Order and UpdatedAt for each note based on its position in request.Order
        foreach (var note in notes)
        {
            var newOrder = request.Order.IndexOf(note.Id);
            note.Order = newOrder;
            note.UpdatedAt = DateTime.UtcNow;
        }

        // Save changes to the database
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (Exception)
        {
            return false; // Database save failed
        }
    }
}