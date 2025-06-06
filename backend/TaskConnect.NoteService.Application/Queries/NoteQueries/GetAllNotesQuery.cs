using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.NoteService.Domain.Common.Interfaces;
using TaskConnect.NoteService.Domain.Models;

namespace TaskConnect.NoteService.Application.Queries.NoteQueries;

public class GetAllNotesQuery(string ownerId, bool isArchived = false) : IRequest<List<NoteResponseModel>>
{
    public string OwnerId { get; } = ownerId;

    public bool IsArchived { get; set; } = isArchived;
}

public class GetAllNotesQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetAllNotesQuery, List<NoteResponseModel>>
{
    public async Task<List<NoteResponseModel>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
    {
        var notes = await context.Notes
            .Include(i => i.ChecklistItems)
            .Where(n => n.OwnerId == request.OwnerId && n.IsArchived == request.IsArchived)
            .OrderByDescending(n => n.Pinned)
            .ThenBy(n => n.Order)
            .ToListAsync(cancellationToken);

        return mapper.Map<List<NoteResponseModel>>(notes);
    }
}