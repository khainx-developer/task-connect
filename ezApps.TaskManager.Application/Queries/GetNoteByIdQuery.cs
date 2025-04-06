﻿using AutoMapper;
using ezApps.TaskManager.Application.Common.Interfaces;
using ezApps.TaskManager.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ezApps.TaskManager.Application.Queries;

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
            .FirstOrDefaultAsync(n => n.Id == request.Id && n.UserId == request.UserId && !n.IsArchived, cancellationToken);

        if (note == null) return null;

        return _mapper.Map<NoteResponseModel>(note);
    }
}