using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskConnect.TaskService.Domain.Entities;

public class ProjectSetting
{
    [Key] public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project Project { get; set; }
    public Guid UserSettingId { get; set; }
    public DateTime CreatedAt { get; set; }
}