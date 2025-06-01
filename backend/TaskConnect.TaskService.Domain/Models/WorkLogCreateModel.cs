namespace TaskConnect.TaskService.Domain.Models;

public class WorkLogCreateUpdateModel
{
    public Guid? TaskItemId { get; set; }
    public DateTime FromTime { get; set; }
    public DateTime? ToTime { get; set; }
    public string Title { get; set; }
    public Guid? ProjectId { get; set; }
}