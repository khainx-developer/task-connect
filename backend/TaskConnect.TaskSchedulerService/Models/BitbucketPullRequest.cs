using System;
using System.Collections.Generic;

namespace TaskConnect.TaskSchedulerService.Models;

public class BitbucketPullRequest
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Status { get; set; }
    public string SourceBranch { get; set; }
    public string DestinationBranch { get; set; }
    public string Author { get; set; }
    public DateTime? Created { get; set; }
    public DateTime? Updated { get; set; }
    public List<string> Reviewers { get; set; } = new List<string>();
    public int CommentsCount { get; set; }
}