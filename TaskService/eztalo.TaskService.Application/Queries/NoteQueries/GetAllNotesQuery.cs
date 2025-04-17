using AutoMapper;
using eztalo.TaskService.Domain.Models;
using eztalo.TaskService.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries;

public class GetAllNotesQuery : IRequest<List<NoteResponseModel>>
{
    public string UserId { get; }

    public bool IsArchived { get; set; }

    public GetAllNotesQuery(string userId, bool isArchived = false)
    {
        UserId = userId;
        IsArchived = isArchived;
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
            .Where(n => n.UserId == request.UserId && n.IsArchived == request.IsArchived)
            .OrderByDescending(n => n.Pinned)
            .ThenBy(n => n.Order)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<NoteResponseModel>>(notes);
    }
}