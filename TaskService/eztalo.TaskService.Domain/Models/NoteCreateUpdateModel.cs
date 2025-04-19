namespace eztalo.TaskService.Domain.Models;

public class NoteCreateUpdateModel
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
}