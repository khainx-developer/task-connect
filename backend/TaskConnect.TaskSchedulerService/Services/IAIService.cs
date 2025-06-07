using System.Collections.Generic;
using System.Threading.Tasks;
using TaskConnect.TaskSchedulerService.Models;

namespace TaskConnect.TaskSchedulerService.Services;

public interface IAIService
{
    Task<string> GenerateWorkSummaryAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs);
    Task<List<string>> GenerateSuggestionsAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs);
    Task<string> GenerateProductivityInsightsAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs);
    Task<string> GenerateRiskAnalysisAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs);
    Task<int> CalculateProductivityScoreAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs);
}