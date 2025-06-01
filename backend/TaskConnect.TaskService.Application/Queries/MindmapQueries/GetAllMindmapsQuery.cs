using System.Text.Json;
using AutoMapper;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Application.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Queries.MindmapQueries;

public record GetAllMindmapsQuery(string OwnerId, bool IsArchived = false) : IRequest<List<MindmapResponseModel>>;

public class GetAllMindmapsQueryHandler : IRequestHandler<GetAllMindmapsQuery, List<MindmapResponseModel>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllMindmapsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<MindmapResponseModel>> Handle(GetAllMindmapsQuery request, CancellationToken cancellationToken)
    {
        var mindmaps = await _context.Mindmaps
            .Where(m => m.OwnerId == request.OwnerId && m.IsArchived == request.IsArchived)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        return mindmaps.Select(mindmap =>
        {
            var response = _mapper.Map<MindmapResponseModel>(mindmap);
            response.Nodes = JsonSerializer.Deserialize<List<MindmapNodeModel>>(mindmap.Nodes);
            response.Edges = JsonSerializer.Deserialize<List<MindmapEdgeModel>>(mindmap.Edges);
            return response;
        }).ToList();
    }
} 