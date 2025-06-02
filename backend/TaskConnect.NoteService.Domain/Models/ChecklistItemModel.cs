namespace TaskConnect.NoteService.Domain.Models;

public class ChecklistItemModel
{
    public Guid? Id { get; set; } // Null for new items
    public string Text { get; set; }
    public bool IsCompleted { get; set; }
    public int Order { get; set; }
}