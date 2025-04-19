using System.ComponentModel.DataAnnotations;

namespace eztalo.TaskService.Domain.Entities;

public class Note
{
    public Guid Id { get; set; }
    [Required] public string OwnerId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public bool Pinned { get; set; } = false;
    public string Color { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsArchived { get; set; }
    public int Order { get; set; }
}