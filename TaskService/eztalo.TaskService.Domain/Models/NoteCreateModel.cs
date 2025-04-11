namespace eztalo.TaskService.Domain.Models
{
    public class NoteCreateModel
    {
        public string Title { get; set; }

        public string Content { get; set; }

        public bool Pinned { get; set; } = false;
    }
}