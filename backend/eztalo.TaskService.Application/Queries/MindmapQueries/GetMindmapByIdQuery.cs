using System.Text.Json;
using AutoMapper;
using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Queries.MindmapQueries;

public record GetMindmapByIdQuery(Guid Id, string OwnerId) : IRequest<MindmapResponseModel>;

public class GetMindmapByIdQueryHandler : IRequestHandler<GetMindmapByIdQuery, MindmapResponseModel>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetMindmapByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<MindmapResponseModel> Handle(GetMindmapByIdQuery request, CancellationToken cancellationToken)
    {
        var mindmap = await _context.Mindmaps
            .FirstOrDefaultAsync(m => m.Id == request.Id && m.OwnerId == request.OwnerId && !m.IsArchived, cancellationToken);

        if (mindmap == null)
        {
            return null;
        }

        var response = _mapper.Map<MindmapResponseModel>(mindmap);
        response.Nodes = JsonSerializer.Deserialize<List<MindmapNodeModel>>(mindmap.Nodes);
        response.Edges = JsonSerializer.Deserialize<List<MindmapEdgeModel>>(mindmap.Edges);
        return response;
    }
} 