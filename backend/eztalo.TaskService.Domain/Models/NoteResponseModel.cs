using eztalo.TaskService.Domain.Entities;

namespace eztalo.TaskService.Domain.Models;

public class NoteResponseModel
{
    public Guid Id { get; set; }
    public string OwnerId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public NoteType Type { get; set; }
    public bool Pinned { get; set; }
    public string Color { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsArchived { get; set; }
    public int Order { get; set; }
    public List<ChecklistItemModel> ChecklistItems { get; set; }
}