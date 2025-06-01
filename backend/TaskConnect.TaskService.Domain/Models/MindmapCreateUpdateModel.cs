using System.Text.Json;

namespace TaskConnect.TaskService.Domain.Models;

public class MindmapCreateUpdateModel
{
    public string Title { get; set; }
    public List<MindmapNodeModel> Nodes { get; set; } = new List<MindmapNodeModel>();
    public List<MindmapEdgeModel> Edges { get; set; } = new List<MindmapEdgeModel>();
}

public class MindmapNodeModel
{
    public string Id { get; set; }
    public string Type { get; set; } = "custom";
    public string Label { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public JsonElement? Style { get; set; }
}

public class MindmapEdgeModel
{
    public string Id { get; set; }
    public string Source { get; set; }
    public string Target { get; set; }
    public string? Type { get; set; }
    public JsonElement? Style { get; set; }
} 