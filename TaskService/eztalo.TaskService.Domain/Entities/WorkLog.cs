namespace eztalo.TaskService.Domain.Entities;

public class WorkLog
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public DateTime FromTime { get; set; }
    public DateTime? ToTime { get; set; }
    public int? PercentCompleteAfter { get; set; }
    public bool IsArchived { get; set; }

    public TaskItem TaskItem { get; set; }
}