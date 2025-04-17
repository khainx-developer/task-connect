using eztalo.TaskService.Application.Common.Interfaces;
using eztalo.TaskService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Application.Commands.TaskCommands;

public record CreateTaskCommand(
    string Title,
    Guid? ProjectId,
    string NewProjectName, // if creating a new one
    string Description,
    DateTime? DueDate,
    List<string> Tags
) : IRequest<Guid>;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        Guid? projectId = request.ProjectId;

        if (!string.IsNullOrWhiteSpace(request.NewProjectName))
        {
            var newProject = new Project
            {
                Id = Guid.NewGuid(),
                Name = request.NewProjectName
            };

            _context.Projects.Add(newProject);
            await _context.SaveChangesAsync(cancellationToken);
            projectId = newProject.Id;
        }
        else if (request.ProjectId.HasValue)
        {
            if (!await _context.Projects.AnyAsync(p => p.Id == request.ProjectId.Value, cancellationToken))
            {
                throw new Exception("Project not found");
            }
        }

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            ProjectId = projectId,
            Description = request.Description,
            DueDate = request.DueDate
        };

        if (request.Tags is not null && request.Tags.Any())
        {
            var tags = await _context.Tags
                .Where(t => request.Tags.Contains(t.Name))
                .ToListAsync(cancellationToken);

            var newTagNames = request.Tags.Except(tags.Select(t => t.Name));

            foreach (var tagName in newTagNames)
            {
                var newTag = new Tag { Id = Guid.NewGuid(), Name = tagName };
                _context.Tags.Add(newTag);
                tags.Add(newTag);
            }

            task.Tags = tags;
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}