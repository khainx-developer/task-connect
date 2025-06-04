using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.NoteService.Application.Common.Interfaces;

namespace TaskConnect.NoteService.Application.Queries.NoteQueries;

public record GetTotalNotesCountQuery(
    string OwnerId
) : IRequest<int>;

public class GetTotalNotesCountQueryHandler : IRequestHandler<GetTotalNotesCountQuery, int>
{
    private readonly IApplicationDbContext _context;

    public GetTotalNotesCountQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(GetTotalNotesCountQuery request, CancellationToken cancellationToken)
    {
        var totalCount = await _context.Notes
            .CountAsync(n => n.OwnerId == request.OwnerId, cancellationToken);

        return totalCount;
    }
} 