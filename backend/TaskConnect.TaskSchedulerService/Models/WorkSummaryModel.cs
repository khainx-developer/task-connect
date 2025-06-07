using System;
using System.Collections.Generic;

namespace TaskConnect.TaskSchedulerService.Models;

public class WorkSummaryModel
{
    public DateTime SyncDate { get; set; }
    public List<JiraTicket> ActiveTickets { get; set; } = new List<JiraTicket>();
    public List<BitbucketPullRequest> ActivePRs { get; set; } = new List<BitbucketPullRequest>();
    public List<string> ActionItems { get; set; } = new List<string>();
    public string NextSteps { get; set; }
}
