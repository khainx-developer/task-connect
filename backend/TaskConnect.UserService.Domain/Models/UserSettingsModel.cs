using TaskConnect.UserService.Domain.Constants;

namespace TaskConnect.UserService.Domain.Models;

public class UserSettingsModel
{
    public Guid SettingId { get; set; }
    public string SettingName { get; set; }
    public string SettingTypeName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public UserSettingType SettingTypeId { get; set; }
} 