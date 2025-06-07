using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskConnect.TaskService.Domain.Entities;

public class WorkSummary
{
    [Key] public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project Project { get; set; }
    public DateTime SyncDate { get; set; }
    public string TicketsJson { get; set; }
    public string PRsJson { get; set; }
    public string ActionItemsJson { get; set; }
    public string NextSteps { get; set; }
    public string AISummary { get; set; }
    public string AISuggestions { get; set; }
    public string ProductivityInsights { get; set; }
    public string RiskAnalysis { get; set; }
    public int ProductivityScore { get; set; }
    public DateTime CreatedAt { get; set; }
}