namespace TaskConnect.TaskService.Domain.Models
{
    public class WorkLogResponseModel
    {
        public Guid Id { get; set; }
        public Guid TaskItemId { get; set; }
        public DateTime FromTime { get; set; }
        public DateTime ToTime { get; set; }
        public int? PercentCompleteAfter { get; set; }
        public TaskResponseModel TaskItem { get; set; } = null!;
    }
}