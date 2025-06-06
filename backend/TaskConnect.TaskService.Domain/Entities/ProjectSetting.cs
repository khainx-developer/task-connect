using System.ComponentModel.DataAnnotations;

namespace TaskConnect.TaskService.Domain.Entities;

public class ProjectSetting
{
    [Key]
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }
    public Guid SettingId { get; set; }
    public DateTime CreatedAt { get; set; }
}