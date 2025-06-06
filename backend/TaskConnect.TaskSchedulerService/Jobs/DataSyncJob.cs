using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaskConnect.TaskSchedulerService.Models;
using TaskConnect.TaskSchedulerService.Services;

namespace TaskConnect.TaskSchedulerService.Jobs;

public class DataSyncJob
{
    private readonly IJiraService _jiraService;
    private readonly IBitbucketService _bitbucketService;
    private readonly ILogger<DataSyncJob> _logger;
    private readonly IConfiguration _config;

    public DataSyncJob(IJiraService jiraService, IBitbucketService bitbucketService, 
                      ILogger<DataSyncJob> logger, IConfiguration config)
    {
        _jiraService = jiraService;
        _bitbucketService = bitbucketService;
        _logger = logger;
        _config = config;
    }

    [DisableConcurrentExecution(timeoutInSeconds: 60 * 10)] // 10 minutes timeout
    public async Task SyncDataAsync()
    {
        try
        {
            _logger.LogInformation("Starting data sync job at {Time}", DateTime.UtcNow);

            var assignee = _config["JiraSettings:DefaultAssignee"];
            var workspace = _config["BitbucketSettings:Workspace"];
            var repository = _config["BitbucketSettings:Repository"];
            var author = _config["BitbucketSettings:DefaultAuthor"];

            // Fetch Jira tickets
            var jiraTickets = await _jiraService.GetAssignedTicketsAsync(assignee);
            _logger.LogInformation("Fetched {Count} Jira tickets", jiraTickets.Count);

            // Fetch Bitbucket PRs
            var pullRequests = await _bitbucketService.GetPullRequestsByAuthorAsync(workspace, repository, author);
            _logger.LogInformation("Fetched {Count} pull requests", pullRequests.Count);

            // Generate work summary
            var workSummary = GenerateWorkSummary(jiraTickets, pullRequests);

            // Save to your Eztalo app (implement based on your data layer)
            await SaveWorkSummaryAsync(workSummary);

            _logger.LogInformation("Data sync completed successfully at {Time}", DateTime.UtcNow);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during data sync");
            throw; // Re-throw to let Hangfire handle retry logic
        }
    }

    private WorkSummary GenerateWorkSummary(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        var summary = new WorkSummary
        {
            SyncDate = DateTime.UtcNow,
            ActiveTickets = tickets,
            ActivePRs = prs
        };

        // Generate action items based on data
        summary.ActionItems.AddRange(GenerateActionItems(tickets, prs));
        summary.NextSteps = GenerateNextSteps(tickets, prs);

        return summary;
    }

    private List<string> GenerateActionItems(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        var actionItems = new List<string>();

        // Check for high priority tickets
        var highPriorityTickets = tickets.Where(t => t.Priority == "High" || t.Priority == "Critical").ToList();
        if (highPriorityTickets.Any())
        {
            actionItems.Add($"Review {highPriorityTickets.Count} high priority tickets: {string.Join(", ", highPriorityTickets.Select(t => t.Key))}");
        }

        // Check for PRs needing attention
        var prsNeedingReview = prs.Where(pr => pr.CommentsCount > 0 && pr.Status == "OPEN").ToList();
        if (prsNeedingReview.Any())
        {
            actionItems.Add($"Address comments on {prsNeedingReview.Count} PRs: {string.Join(", ", prsNeedingReview.Select(pr => $"#{pr.Id}"))}");
        }

        // Check for stale PRs
        var stalePRs = prs.Where(pr => pr.Updated.HasValue && pr.Updated.Value < DateTime.UtcNow.AddDays(-3)).ToList();
        if (stalePRs.Any())
        {
            actionItems.Add($"Update {stalePRs.Count} stale PRs (>3 days old)");
        }

        // Check for tickets in progress without PRs
        var inProgressTickets = tickets.Where(t => t.Status == "In Progress" || t.Status == "Development").ToList();
        var ticketsWithoutPRs = inProgressTickets.Where(ticket => 
            !prs.Any(pr => pr.Title.Contains(ticket.Key) || pr.SourceBranch.Contains(ticket.Key))).ToList();
        
        if (ticketsWithoutPRs.Any())
        {
            actionItems.Add($"Create PRs for {ticketsWithoutPRs.Count} in-progress tickets");
        }

        return actionItems;
    }

    private string GenerateNextSteps(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        var nextSteps = new StringBuilder();

        if (tickets.Any(t => t.Priority == "Critical"))
        {
            nextSteps.AppendLine("🚨 Focus on critical priority tickets first");
        }

        if (prs.Any(pr => pr.CommentsCount > 0))
        {
            nextSteps.AppendLine("💬 Address PR review comments");
        }

        if (tickets.Count(t => t.Status == "To Do") > 5)
        {
            nextSteps.AppendLine("📋 Prioritize backlog - too many tickets in To Do");
        }

        if (prs.Count > 10)
        {
            nextSteps.AppendLine("🔄 Consider merging completed PRs to reduce open PR count");
        }

        return nextSteps.Length > 0 ? nextSteps.ToString() : "✅ All caught up! Good work.";
    }

    private async Task SaveWorkSummaryAsync(WorkSummary summary)
    {
        // Implement based on your Eztalo app's data layer
        // This could be Entity Framework, MongoDB, or any other storage
        
        // Example with Entity Framework:
        // using var scope = serviceProvider.CreateScope();
        // var dbContext = scope.ServiceProvider.GetRequiredService<EztaloDbContext>();
        // 
        // var summaryEntity = new WorkSummaryEntity
        // {
        //     SyncDate = summary.SyncDate,
        //     TicketsJson = JsonSerializer.Serialize(summary.ActiveTickets),
        //     PRsJson = JsonSerializer.Serialize(summary.ActivePRs),
        //     ActionItemsJson = JsonSerializer.Serialize(summary.ActionItems),
        //     NextSteps = summary.NextSteps
        // };
        // 
        // dbContext.WorkSummaries.Add(summaryEntity);
        // await dbContext.SaveChangesAsync();

        _logger.LogInformation("Work summary saved with {TicketCount} tickets and {PRCount} PRs", 
            summary.ActiveTickets.Count, summary.ActivePRs.Count);
    }
}
