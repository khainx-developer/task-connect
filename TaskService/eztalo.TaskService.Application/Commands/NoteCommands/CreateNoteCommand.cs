using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Domain.Models;
using MediatR;

namespace eztalo.TaskService.Application.Commands.NoteCommands;

public record CreateNoteCommand(string OwnerId, string Title, string Content)
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
            OwnerId = request.OwnerId,
            Title = request.Title,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Notes.Add(note);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<NoteResponseModel>(note);
    }
}