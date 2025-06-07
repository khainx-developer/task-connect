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

    // AI-generated content
    public string AISummary { get; set; }
    public List<string> AISuggestions { get; set; } = new List<string>();
    public string ProductivityInsights { get; set; }
    public string RiskAnalysis { get; set; }
    public int ProductivityScore { get; set; }
}

public class AIAnalysisRequest
{
    public string Context { get; set; }
    public object Data { get; set; }
    public string AnalysisType { get; set; }
}

public class AIAnalysisResponse
{
    public string Summary { get; set; }
    public List<string> Suggestions { get; set; } = new List<string>();
    public string Insights { get; set; }
    public string RiskAnalysis { get; set; }
    public int Score { get; set; }
}