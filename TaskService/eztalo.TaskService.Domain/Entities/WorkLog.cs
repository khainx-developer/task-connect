using System.ComponentModel.DataAnnotations.Schema;

namespace eztalo.TaskService.Domain.Entities;

public class WorkLog
{
    public Guid Id { get; set; }
    public Guid TaskItemId { get; set; }
    public DateTime FromTime { get; set; }
    public DateTime? ToTime { get; set; }
    public int? PercentCompleteAfter { get; set; }
    public bool IsArchived { get; set; }

    [ForeignKey(nameof(TaskItemId))] public TaskItem TaskItem { get; set; }
}