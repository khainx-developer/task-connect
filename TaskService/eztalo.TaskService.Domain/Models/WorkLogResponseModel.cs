namespace eztalo.TaskService.Domain.Models
{
    public class WorkLogResponseModel
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }
        public DateTime FromTime { get; set; }
        public DateTime ToTime { get; set; }
        public int? PercentCompleteAfter { get; set; }
        public string Note { get; set; }

        public TaskResponseModel Task { get; set; } = null!;
    }
}