using MediatR;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Application.Common.Interfaces;
using Task = eztalo.TaskService.Domain.Entities.Task;

namespace eztalo.TaskService.Application.Commands
{
    public class CreateTaskCommand : IRequest<Task>
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Task>
    {
        private readonly IApplicationDbContext _context;

        public CreateTaskCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Task> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
        {
            var task = new Task
            {
                Title = request.Title,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync(cancellationToken);

            return task;
        }
    }
}