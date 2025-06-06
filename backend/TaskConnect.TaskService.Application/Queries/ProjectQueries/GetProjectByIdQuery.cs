using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;
using TaskConnect.TaskService.Domain.Models;

namespace TaskConnect.TaskService.Application.Queries.ProjectQueries;

public record GetProjectByIdQuery(Guid ProjectId, string UserId) : IRequest<ProjectResponseModel>;

public class GetProjectByIdQueryHandler : IRequestHandler<GetProjectByIdQuery, ProjectResponseModel>
{
    private readonly IApplicationDbContext _context;

    public GetProjectByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProjectResponseModel> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.ProjectSettings)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && p.OwnerId == request.UserId, cancellationToken);

        if (project == null)
        {
            throw new Exception("Project not found");
        }

        return new ProjectResponseModel
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            OwnerId = project.OwnerId,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            IsArchived = project.IsArchived,
            ProjectSettings = project.ProjectSettings.Select(ps => new ProjectSettingModel
            {
                Id = ps.Id,
                UserSettingId = ps.UserSettingId,
                CreatedAt = ps.CreatedAt
            }).ToList()
        };
    }
} 