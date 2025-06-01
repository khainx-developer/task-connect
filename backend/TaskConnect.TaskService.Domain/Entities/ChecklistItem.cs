using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskConnect.TaskService.Domain.Entities;

public class ChecklistItem
{
    public Guid Id { get; set; }
    public Guid NoteId { get; set; }
    [Required] public string Text { get; set; }
    public bool IsCompleted { get; set; } = false;
    public int Order { get; set; } // To maintain the order of checklist items
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(NoteId))] public Note Note { get; set; }
}