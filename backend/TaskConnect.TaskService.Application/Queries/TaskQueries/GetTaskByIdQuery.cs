using AutoMapper;
using TaskConnect.TaskService.Domain.Entities;
using TaskConnect.TaskService.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;

namespace TaskConnect.TaskService.Application.Queries.TaskQueries;

public record GetTaskByIdQuery(Guid Id, string OwnerId) : IRequest<TaskResponseModel>;

public class GetTaskByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetTaskByIdQuery, TaskResponseModel>
{
    public async Task<TaskResponseModel> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var taskItem = await context.TaskItems
            .Include(t => t.Project)
            .Include(t => t.WorkLogs)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.OwnerId == request.OwnerId, cancellationToken);

        return mapper.Map<TaskItem, TaskResponseModel>(taskItem);
    }
}