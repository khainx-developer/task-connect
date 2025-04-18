using eztalo.TaskService.Domain.Entities;

namespace eztalo.TaskService.Domain.Models
{
    public class TaskResponseModel
    {
        public Guid Id { get; set; }
        public Guid? ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = "open";
        public string UserId { get; set; }
        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ProjectResponseModel Project { get; set; }
        public ICollection<WorkLogResponseModel> WorkLogs { get; set; } = new List<WorkLogResponseModel>();
        public ICollection<TagResponseModel> Tags { get; set; } = new List<TagResponseModel>();
    }
}