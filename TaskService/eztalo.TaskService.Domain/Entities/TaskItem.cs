namespace eztalo.TaskService.Domain.Entities
{
    public class TaskItem
    {
        public int Id { get; set; }  // Primary Key
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}