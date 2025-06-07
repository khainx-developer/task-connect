using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TaskConnect.TaskSchedulerService.Models;
public class BitbucketPRResponse
{
    [JsonPropertyName("values")]
    public List<BitbucketPR> Values { get; set; } = new List<BitbucketPR>();
}

public class BitbucketPR
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    
    [JsonPropertyName("title")]
    public string Title { get; set; }
    
    [JsonPropertyName("state")]
    public string State { get; set; }
    
    [JsonPropertyName("source")]
    public BitbucketBranch Source { get; set; }
    
    [JsonPropertyName("destination")]
    public BitbucketBranch Destination { get; set; }
    
    [JsonPropertyName("author")]
    public BitbucketUser Author { get; set; }
    
    [JsonPropertyName("created_on")]
    public string CreatedOnText { get; set; }
    
    public DateTime? CreatedOn => DateTime.TryParse(CreatedOnText, out var date) ? date : null;
    
    [JsonPropertyName("updated_on")]
    public string UpdatedOnText { get; set; }
    
    public DateTime? UpdatedOn => DateTime.TryParse(UpdatedOnText, out var date) ? date : null;
    
    [JsonPropertyName("reviewers")]
    public List<BitbucketUser> Reviewers { get; set; }
    
    [JsonPropertyName("comment_count")]
    public int CommentCount { get; set; }
}

public class BitbucketBranch
{
    [JsonPropertyName("branch")]
    public BitbucketBranchInfo Branch { get; set; }
}

public class BitbucketBranchInfo
{
    [JsonPropertyName("name")]
    public string Name { get; set; }
}

public class BitbucketUser
{
    [JsonPropertyName("display_name")]
    public string DisplayName { get; set; }
}