using System.ComponentModel.DataAnnotations;

namespace TaskConnect.TaskService.Domain.Entities;

public enum NoteType
{
    Text = 0,
    Checklist = 1
}

public class Note
{
    public Guid Id { get; set; }
    [Required] public string OwnerId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; } // Used for Text notes
    public NoteType Type { get; set; } = NoteType.Text; // Default to Text note
    public bool Pinned { get; set; } = false;
    public string Color { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsArchived { get; set; }
    public int Order { get; set; }

    public ICollection<ChecklistItem> ChecklistItems { get; set; } =
        new List<ChecklistItem>(); // Used for Checklist notes
}