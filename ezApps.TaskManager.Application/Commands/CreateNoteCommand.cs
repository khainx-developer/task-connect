using AutoMapper;
using ezApps.TaskManager.Application.Common.Interfaces;
using ezApps.TaskManager.Domain.Entities;
using ezApps.TaskManager.Domain.Models;
using MediatR;

namespace ezApps.TaskManager.Application.Commands;

public record CreateNoteCommand(string UserId, string? Title, string? Content, bool Pinned)
    : IRequest<NoteResponseModel>;

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
            UserId = request.UserId,
            Title = request.Title,
            Content = request.Content,
            Pinned = request.Pinned,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Notes.Add(note);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<NoteResponseModel>(note);
    }
}