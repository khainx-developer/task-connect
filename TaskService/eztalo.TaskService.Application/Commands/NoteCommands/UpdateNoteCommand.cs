using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;

namespace eztalo.TaskService.Application.Commands.NoteCommands;

public record UpdateNoteCommand(Guid Id, string OwnerId, string Title, string Content)
    : IRequest<NoteResponseModel>;

public class UpdateNoteHandler : IRequestHandler<UpdateNoteCommand, NoteResponseModel>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateNoteHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<NoteResponseModel> Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.Notes.FindAsync([request.Id], cancellationToken);
        if (note == null || note.OwnerId != request.OwnerId)
        {
            return null;
        }

        note.Title = request.Title;
        note.Content = request.Content;
        note.UpdatedAt = DateTime.Now.ToUniversalTime();
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<NoteResponseModel>(note);
    }
}