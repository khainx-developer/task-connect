using MediatR;

namespace TaskConnect.TaskService.Application.Commands.ProjectCommands;

public record ArchiveProjectCommand(
    Guid ProjectId,
    string UserId) : IRequest<Guid>; 