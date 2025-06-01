using System.ComponentModel.DataAnnotations;

namespace TaskConnect.TaskService.Domain.Entities;

public class Mindmap
{
    public Guid Id { get; set; }
    [Required] public string OwnerId { get; set; }
    public string Title { get; set; }
    public string Nodes { get; set; } // JSON string containing array of nodes
    public string Edges { get; set; } // JSON string containing array of edges
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsArchived { get; set; }
    public int Order { get; set; }
} 