using MediatR;

namespace TaskConnect.TaskService.Application.Commands.ProjectCommands;

public record UpdateProjectCommand(
    Guid ProjectId,
    string Title,
    string Description,
    string UserId) : IRequest<Guid>; 