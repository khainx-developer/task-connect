using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;
using MediatR;

namespace eztalo.TaskService.Application.Commands.NoteCommands
{
    public record CreateTaskCommand(string Title, string Description, Guid? ProjectId, string OwnerId) : IRequest<Guid>;

    public class CreateTaskCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateTaskCommand, Guid>
    {
        public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
        {
            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                ProjectId = request.ProjectId,
                Description = request.Description,
                OwnerId = request.OwnerId,
                CreatedAt = DateTime.UtcNow
            };

            context.TaskItems.Add(task);
            await context.SaveChangesAsync(cancellationToken);

            return task.Id;
        }
    }
}