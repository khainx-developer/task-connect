using TaskConnect.UserService.Domain.Constants;

namespace TaskConnect.UserService.Domain.Models;

public class UserSettingsDetailModel
{
    public Guid SettingId { get; set; }
    public string SettingName { get; set; }
    public string SettingTypeName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public UserSettingType SettingTypeId { get; set; }
    
    // Jira specific fields
    public string AtlassianEmailAddress { get; set; }
    public string JiraCloudDomain { get; set; }
    
    // Bitbucket specific fields
    public string Username { get; set; }
    public string Workspace { get; set; }
    public string RepositorySlug { get; set; }
} 