using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Application.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Commands.MindmapCommands;

public record DeleteMindmapCommand(Guid Id, string OwnerId) : IRequest<bool>;

public class DeleteMindmapCommandHandler : IRequestHandler<DeleteMindmapCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteMindmapCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteMindmapCommand request, CancellationToken cancellationToken)
    {
        var mindmap = await _context.Mindmaps
            .FirstOrDefaultAsync(m => m.Id == request.Id && m.OwnerId == request.OwnerId, cancellationToken);

        if (mindmap == null)
        {
            return false;
        }

        mindmap.IsArchived = true;
        mindmap.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
} 