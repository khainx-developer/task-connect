using AutoMapper;
using ezApps.TaskManager.Application.Common.Interfaces;
using ezApps.TaskManager.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ezApps.TaskManager.Application.Queries;

public class GetAllNotesQuery : IRequest<List<NoteResponseModel>>
{
    public string UserId { get; }

    public GetAllNotesQuery(string userId)
    {
        UserId = userId;
    }
}

public class GetAllNotesQueryHandler : IRequestHandler<GetAllNotesQuery, List<NoteResponseModel>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllNotesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<NoteResponseModel>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
    {
        var notes = await _context.Notes
            .Where(n => n.UserId == request.UserId && !n.IsArchived)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<NoteResponseModel>>(notes);
    }
}