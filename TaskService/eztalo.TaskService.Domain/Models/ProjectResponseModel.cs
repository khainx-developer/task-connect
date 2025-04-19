namespace eztalo.TaskService.Domain.Models
{
    public abstract class ProjectResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; }
        public string OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
        public bool IsArchived { get; set; }
    }
}