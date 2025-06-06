using AutoMapper;
using MediatR;
using TaskConnect.NoteService.Domain.Common.Interfaces;
using TaskConnect.NoteService.Domain.Entities;
using TaskConnect.NoteService.Domain.Models;

namespace TaskConnect.NoteService.Application.Commands.NoteCommands;

public record CreateNoteCommand(
    string OwnerId,
    string Title,
    string Content,
    NoteType Type,
    List<ChecklistItemModel> ChecklistItems
) : IRequest<NoteResponseModel>;

public class CreateNoteHandler : IRequestHandler<CreateNoteCommand, NoteResponseModel>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateNoteHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<NoteResponseModel> Handle(CreateNoteCommand request, CancellationToken cancellationToken)
    {
        var note = new Note
        {
            Id = Guid.NewGuid(),
            OwnerId = request.OwnerId,
            Title = request.Title,
            Content = request.Type == NoteType.Text
                ? request.Content
                : string.Empty, // Content used only for Text notes
            Type = request.Type,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Add checklist items for Checklist notes
        if (request.Type == NoteType.Checklist && request.ChecklistItems != null)
        {
            foreach (var item in request.ChecklistItems)
            {
                note.ChecklistItems.Add(new ChecklistItem
                {
                    Id = Guid.NewGuid(),
                    NoteId = note.Id,
                    Text = item.Text,
                    IsCompleted = item.IsCompleted,
                    Order = item.Order,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        _context.Notes.Add(note);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<NoteResponseModel>(note);
    }
}