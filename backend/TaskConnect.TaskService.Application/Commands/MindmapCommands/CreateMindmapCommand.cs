using System.Text.Json;
using AutoMapper;
using TaskConnect.TaskService.Domain.Entities;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using TaskConnect.TaskService.Application.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.MindmapCommands;

public record CreateMindmapCommand(
    string OwnerId,
    string Title,
    List<MindmapNodeModel> Nodes,
    List<MindmapEdgeModel> Edges
) : IRequest<MindmapResponseModel>;

public class CreateMindmapCommandHandler : IRequestHandler<CreateMindmapCommand, MindmapResponseModel>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateMindmapCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<MindmapResponseModel> Handle(CreateMindmapCommand request, CancellationToken cancellationToken)
    {
        var mindmap = new Mindmap
        {
            Id = Guid.NewGuid(),
            OwnerId = request.OwnerId,
            Title = request.Title,
            Nodes = JsonSerializer.Serialize(request.Nodes),
            Edges = JsonSerializer.Serialize(request.Edges),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Mindmaps.Add(mindmap);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<MindmapResponseModel>(mindmap);
    }
} 