namespace ezApps.TaskManager.Domain.Entities;

public class Note
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public bool Pinned { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsArchived { get; set; }
}