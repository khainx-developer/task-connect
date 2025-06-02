using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.NoteService.Application.Common.Interfaces;
using TaskConnect.NoteService.Domain.Models;

namespace TaskConnect.NoteService.Application.Queries.NoteQueries;

public class GetNoteByIdQuery(Guid id, string ownerId) : IRequest<NoteResponseModel>
{
    public Guid Id { get; } = id;
    public string OwnerId { get; } = ownerId;
}

public class GetNoteByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetNoteByIdQuery, NoteResponseModel>
{
    public async Task<NoteResponseModel> Handle(GetNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var note = await context.Notes
            .Include(i => i.ChecklistItems)
            .FirstOrDefaultAsync(n => n.Id == request.Id && n.OwnerId == request.OwnerId && !n.IsArchived,
                cancellationToken);

        if (note == null) return null;

        return mapper.Map<NoteResponseModel>(note);
    }
}