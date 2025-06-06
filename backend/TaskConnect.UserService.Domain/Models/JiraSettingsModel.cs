namespace TaskConnect.UserService.Domain.Models;

public class JiraSettingsModel
{
    public string JiraCloudDomain { get; set; }
    public string AtlassianEmailAddress { get; set; }
    public string ApiToken { get; set; }
    public string Name { get; set; }
}