namespace ezApps.TaskManager.Domain.Models
{
    public class NoteResponseModel
    {
        public Guid Id { get; set; }

        public string Title { get; set; }

        public string Content { get; set; }
        public string Color { get; set; }

        public bool Pinned { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}