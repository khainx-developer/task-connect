using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eztalo.TaskService.Domain.Entities;

public class MindmapNode
{
    public Guid Id { get; set; }
    public Guid MindmapId { get; set; }
    [Required] public string Label { get; set; }
    public string Type { get; set; } = "custom"; // custom, input, output
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public string Style { get; set; } // JSON string for node style
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(MindmapId))]
    public Mindmap Mindmap { get; set; }
} 