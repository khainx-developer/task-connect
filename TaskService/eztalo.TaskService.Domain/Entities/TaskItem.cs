namespace eztalo.TaskService.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public string Status { get; set; } = "open";
    public string UserId { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Project Project { get; set; }
    public ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}