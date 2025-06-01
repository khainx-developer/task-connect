using System.Text.Json;

namespace TaskConnect.TaskService.Domain.Models;

public class MindmapResponseModel
{
    public Guid Id { get; set; }
    public string OwnerId { get; set; }
    public string Title { get; set; }
    public List<MindmapNodeModel> Nodes { get; set; }
    public List<MindmapEdgeModel> Edges { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsArchived { get; set; }
    public int Order { get; set; }
} 