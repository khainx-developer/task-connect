namespace eztalo.TaskService.Domain.Entities;

public class Project
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; }
    public string UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Task> Tasks { get; set; } = new List<Task>();
    public bool IsArchived { get; set; }
}