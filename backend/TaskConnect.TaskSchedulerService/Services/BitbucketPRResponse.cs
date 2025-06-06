using System;
using System.Collections.Generic;

namespace TaskConnect.TaskSchedulerService.Services;
public class BitbucketPRResponse
{
    public List<BitbucketPR> Values { get; set; } = new List<BitbucketPR>();
}

public class BitbucketPR
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string State { get; set; }
    public BitbucketBranch Source { get; set; }
    public BitbucketBranch Destination { get; set; }
    public BitbucketUser Author { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public List<BitbucketUser> Reviewers { get; set; }
    public int CommentCount { get; set; }
}

public class BitbucketBranch
{
    public BitbucketBranchInfo Branch { get; set; }
}

public class BitbucketBranchInfo
{
    public string Name { get; set; }
}

public class BitbucketUser
{
    public string DisplayName { get; set; }
}