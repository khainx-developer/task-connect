using System.Text.Json;
using AutoMapper;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Application.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.MindmapCommands;

public record UpdateMindmapCommand(
    Guid Id,
    string OwnerId,
    string Title,
    List<MindmapNodeModel> Nodes,
    List<MindmapEdgeModel> Edges
) : IRequest<MindmapResponseModel>;

public class UpdateMindmapCommandHandler : IRequestHandler<UpdateMindmapCommand, MindmapResponseModel>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateMindmapCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<MindmapResponseModel> Handle(UpdateMindmapCommand request, CancellationToken cancellationToken)
    {
        var mindmap = await _context.Mindmaps
            .FirstOrDefaultAsync(m => m.Id == request.Id && m.OwnerId == request.OwnerId, cancellationToken);

        if (mindmap == null)
        {
            return null;
        }

        mindmap.Title = request.Title;
        mindmap.Nodes = JsonSerializer.Serialize(request.Nodes);
        mindmap.Edges = JsonSerializer.Serialize(request.Edges);
        mindmap.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<MindmapResponseModel>(mindmap);
    }
} 