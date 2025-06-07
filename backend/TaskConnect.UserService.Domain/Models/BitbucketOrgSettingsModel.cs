namespace TaskConnect.UserService.Domain.Models;

public class BitbucketOrgSettingsModel
{
    public string Name { get; set; }
    public string Username { get; set; }
    public string AppPassword { get; set; }
    public string Workspace { get; set; }
    public string RepositorySlug { get; set; }
    public string DefaultAuthor { get; set; }
}