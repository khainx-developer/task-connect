namespace TaskConnect.TaskService.Domain.Models
{
    public class TaskResponseModel
    {
        public Guid Id { get; set; }
        public Guid? ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = "open";
        public string OwnerId { get; set; }
        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ProjectResponseModel Project { get; set; }
    }
}