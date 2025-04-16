using AutoMapper;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Domain.Models;
using eztalo.TaskService.Application.Common.Interfaces;
using MediatR;

namespace eztalo.TaskService.Application.Commands;

public record CreateNoteCommand(string UserId, string Title, string Content)
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
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Notes.Add(note);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<NoteResponseModel>(note);
    }
}