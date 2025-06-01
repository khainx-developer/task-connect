namespace TaskConnect.TaskService.Domain.Models;

public class TaskCreateModel
{
    public string Title { get; set; }
    public string Description { get; set; }
    public Guid? ProjectId { get; set; }
}