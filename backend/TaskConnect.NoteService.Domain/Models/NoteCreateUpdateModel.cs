using TaskConnect.NoteService.Domain.Entities;

namespace TaskConnect.NoteService.Domain.Models;

public class NoteCreateUpdateModel
{
    public string Title { get; set; }
    public string Content { get; set; }
    public NoteType Type { get; set; } = NoteType.Text;
    public List<ChecklistItemModel> ChecklistItems { get; set; } = new List<ChecklistItemModel>();
}