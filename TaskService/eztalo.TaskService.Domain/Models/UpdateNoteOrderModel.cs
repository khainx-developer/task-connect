namespace eztalo.TaskService.Domain.Models;

public class UpdateNoteOrderModel
{
    public List<Guid> Order { get; set; }
    public bool Pinned { get; set; }
}