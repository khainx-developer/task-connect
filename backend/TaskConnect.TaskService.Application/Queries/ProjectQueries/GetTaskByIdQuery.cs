using AutoMapper;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Queries.ProjectQueries;

public record GetProjectByIdQuery(Guid Id, string OwnerId) : IRequest<ProjectResponseModel>;

public class GetProjectByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetProjectByIdQuery, ProjectResponseModel>
{
    public async Task<ProjectResponseModel> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var project = await context.Projects
            .Where(t => t.Id == request.Id && t.OwnerId == request.OwnerId)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        return mapper.Map<ProjectResponseModel>(project);
    }
}