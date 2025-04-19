using AutoMapper;
using eztalo.TaskService.Domain.Models;
using eztalo.TaskService.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries;

public class GetNoteByIdQuery : IRequest<NoteResponseModel?>
{
    public Guid Id { get; }
    public string UserId { get; }

    public GetNoteByIdQuery(Guid id, string userId)
    {
        Id = id;
        UserId = userId;
    }
}

public class GetNoteByIdQueryHandler : IRequestHandler<GetNoteByIdQuery, NoteResponseModel?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetNoteByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<NoteResponseModel?> Handle(GetNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var note = await _context.Notes
            .FirstOrDefaultAsync(n => n.Id == request.Id && n.OwnerId == request.UserId && !n.IsArchived, cancellationToken);

        if (note == null) return null;

        return _mapper.Map<NoteResponseModel>(note);
    }
}