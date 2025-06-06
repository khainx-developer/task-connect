using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskConnect.UserService.Domain.Constants;

namespace TaskConnect.UserService.Domain.Entities;

public class UserSetting
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required] public string UserId { get; set; }

    [ForeignKey("UserId")] public User User { get; set; }

    [Required] public UserSettingType Type { get; set; }

    [Required] public string Name { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}