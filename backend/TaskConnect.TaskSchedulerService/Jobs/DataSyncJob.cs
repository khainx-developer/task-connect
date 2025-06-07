using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskConnect.Infrastructure.Core;
using TaskConnect.TaskSchedulerService.Models;
using TaskConnect.TaskSchedulerService.Services;
using TaskConnect.TaskService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Constants;
using TaskConnect.UserService.Domain.Models;
using WorkSummary = TaskConnect.TaskService.Domain.Entities.WorkSummary;

namespace TaskConnect.TaskSchedulerService.Jobs;

public class DataSyncJob
{
    private readonly ILogger<DataSyncJob> _logger;
    private readonly IVaultSecretProvider _vaultSecretProvider;
    private readonly IApplicationDbContext _taskDbContext;
    private readonly UserService.Domain.Common.Interfaces.IApplicationDbContext _userDbContext;
    private readonly IAIService _aiService;

    public DataSyncJob(ILogger<DataSyncJob> logger,
        IVaultSecretProvider vaultSecretProvider, IApplicationDbContext taskDbContext,
        UserService.Domain.Common.Interfaces.IApplicationDbContext userDbContext,
        IAIService aiService)
    {
        _logger = logger;
        _vaultSecretProvider = vaultSecretProvider;
        _taskDbContext = taskDbContext;
        _userDbContext = userDbContext;
        _aiService = aiService;
    }

    [DisableConcurrentExecution(timeoutInSeconds: 60 * 10)] // 10 minutes timeout
    public async Task SyncDataAsync()
    {
        try
        {
            _logger.LogInformation("Starting data sync job at {Time}", DateTime.UtcNow);

            // Get all projects with settings
            var projects = await _taskDbContext.Projects
                .Where(p => p.ProjectSettings != null)
                .Select(p => new
                {
                    p.Id,
                    p.OwnerId,
                    ProjectSettingIds = p.ProjectSettings.Select(ps => ps.UserSettingId)
                })
                .ToListAsync();

            foreach (var project in projects)
            {
                List<JiraTicket> jiraTickets = new List<JiraTicket>();
                List<BitbucketPullRequest> pullRequests = new List<BitbucketPullRequest>();
                foreach (var userSettingId in project.ProjectSettingIds)
                {
                    var userSetting = _userDbContext.UserSettings.SingleOrDefault(ps => ps.Id == userSettingId);
                    if (userSetting == null)
                    {
                        continue;
                    }

                    try
                    {
                        if (userSetting.Type == UserSettingType.Jira)
                        {
                            // Get Jira settings from Vault
                            var jiraSettings = await _vaultSecretProvider.GetJsonSecretAsync<JiraSettingsModel>(
                                $"data/user-settings/{project.OwnerId}/{userSetting.Id}");

                            // Fetch Jira tickets
                            var jiraUrl = $"https://{jiraSettings.JiraCloudDomain}";
                            IJiraService jiraService = new JiraService(jiraUrl,
                                jiraSettings.ApiToken, jiraSettings.AtlassianEmailAddress);
                            jiraTickets.AddRange(
                                await jiraService.GetAssignedTicketsAsync(jiraSettings.AtlassianEmailAddress));
                            _logger.LogInformation("Fetched {Count} Jira tickets for project {ProjectId}",
                                jiraTickets.Count, project.Id);
                        }
                        else if (userSetting.Type == UserSettingType.BitbucketOrg)
                        {
                            var bitbucketSettings =
                                await _vaultSecretProvider.GetJsonSecretAsync<BitbucketOrgSettingsModel>(
                                    $"data/user-settings/{project.OwnerId}/{userSetting.Id}");

                            // Fetch Jira tickets
                            IBitbucketService bitbucketService = new BitbucketService(bitbucketSettings.AppPassword,
                                bitbucketSettings.Username);
                            // Fetch Bitbucket PRs
                            pullRequests.AddRange(await bitbucketService.GetPullRequestsAsync(
                                bitbucketSettings.Workspace,
                                bitbucketSettings.RepositorySlug,
                                bitbucketSettings.DefaultAuthor));
                            _logger.LogInformation("Fetched {Count} pull requests for project {ProjectId}",
                                pullRequests.Count, project.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error occurred during data sync for project {ProjectId}", project.Id);
                        // Continue with next project instead of failing the entire job
                    }
                }

                // Generate work summary
                // var workSummary = GenerateWorkSummary(jiraTickets, pullRequests);
                var workSummary = await GenerateAIEnhancedSummaryAsync(jiraTickets, pullRequests);

                await SaveWorkSummaryAsync(workSummary, project.Id);

                _logger.LogInformation("Data sync completed successfully for project {ProjectId} at {Time}",
                    project.Id, DateTime.UtcNow);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during data sync");
            throw; // Re-throw to let Hangfire handle retry logic
        }
    }

    private WorkSummaryModel GenerateWorkSummary(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        tickets ??= [];
        prs ??= [];
        var summary = new WorkSummaryModel
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
        var highPriorityTickets = tickets.Where(t => t.Priority is "High" or "Critical").ToList();
        if (highPriorityTickets.Any())
        {
            actionItems.Add(
                $"Review {highPriorityTickets.Count} high priority tickets: {string.Join(", ", highPriorityTickets.Select(t => t.Key))}");
        }

        // Check for PRs needing attention
        var prsNeedingReview = prs.Where(pr => pr.CommentsCount > 0 && pr.Status == "OPEN").ToList();
        if (prsNeedingReview.Any())
        {
            actionItems.Add(
                $"Address comments on {prsNeedingReview.Count} PRs: {string.Join(", ", prsNeedingReview.Select(pr => $"#{pr.Id}"))}");
        }

        // Check for stale PRs
        var stalePRs = prs.Where(pr => pr.Updated.HasValue && pr.Updated.Value < DateTime.UtcNow.AddDays(-3)).ToList();
        if (stalePRs.Any())
        {
            actionItems.Add($"Update {stalePRs.Count} stale PRs (>3 days old)");
        }

        // Check for tickets in progress without PRs
        var inProgressTickets = tickets.Where(t => t.Status is "In Progress" or "Development").ToList();
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

        if (tickets.Count(t => t.Status == "To Do") > 3)
        {
            nextSteps.AppendLine("📋 Prioritize backlog - too many tickets in To Do");
        }

        if (prs.Count > 10)
        {
            nextSteps.AppendLine("🔄 Consider merging completed PRs to reduce open PR count");
        }

        return nextSteps.Length > 0 ? nextSteps.ToString() : "✅ All caught up! Good work.";
    }

    private async Task<WorkSummaryModel> GenerateAIEnhancedSummaryAsync(List<JiraTicket> tickets,
        List<BitbucketPullRequest> prs)
    {
        var summary = new WorkSummaryModel
        {
            SyncDate = DateTime.UtcNow,
            ActiveTickets = tickets,
            ActivePRs = prs
        };

        // Generate basic action items (fallback)
        summary.ActionItems.AddRange(GenerateBasicActionItems(tickets, prs));
        summary.NextSteps = GenerateBasicNextSteps(tickets, prs);

        var aiEnable = Environment.GetEnvironmentVariable("AI_ENABLE") ?? "true";
        if (aiEnable == "true")
        {
            // Generate AI-enhanced content
            await GenerateAISummaryAsync(summary, tickets, prs);
            await GenerateAISuggestionsAsync(summary, tickets, prs);
            await GenerateAIInsightsAsync(summary, tickets, prs);
            await GenerateAIRiskAnalysisAsync(summary, tickets, prs);
            await GenerateAIProductivityScoreAsync(summary, tickets, prs);
        }

        return summary;
    }

    private async Task GenerateAISummaryAsync(WorkSummaryModel summary, List<JiraTicket> tickets,
        List<BitbucketPullRequest> prs)
    {
        try
        {
            summary.AISummary = await _aiService.GenerateWorkSummaryAsync(tickets, prs);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate AI summary");
            summary.AISummary = "AI summary generation failed";
        }
    }

    private async Task GenerateAISuggestionsAsync(WorkSummaryModel summary, List<JiraTicket> tickets,
        List<BitbucketPullRequest> prs)
    {
        try
        {
            summary.AISuggestions = await _aiService.GenerateSuggestionsAsync(tickets, prs);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate AI suggestions");
            summary.AISuggestions = new List<string> { "AI suggestions unavailable" };
        }
    }

    private async Task GenerateAIInsightsAsync(WorkSummaryModel summary, List<JiraTicket> tickets,
        List<BitbucketPullRequest> prs)
    {
        try
        {
            summary.ProductivityInsights = await _aiService.GenerateProductivityInsightsAsync(tickets, prs);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate AI insights");
            summary.ProductivityInsights = "AI insights unavailable";
        }
    }

    private async Task GenerateAIRiskAnalysisAsync(WorkSummaryModel summary, List<JiraTicket> tickets,
        List<BitbucketPullRequest> prs)
    {
        try
        {
            summary.RiskAnalysis = await _aiService.GenerateRiskAnalysisAsync(tickets, prs);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate AI risk analysis");
            summary.RiskAnalysis = "AI risk analysis unavailable";
        }
    }

    private async Task GenerateAIProductivityScoreAsync(WorkSummaryModel summary, List<JiraTicket> tickets,
        List<BitbucketPullRequest> prs)
    {
        try
        {
            summary.ProductivityScore = await _aiService.CalculateProductivityScoreAsync(tickets, prs);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to calculate AI productivity score");
            summary.ProductivityScore = 0;
        }
    }

    // Fallback methods (same as before)
    private List<string> GenerateBasicActionItems(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        var actionItems = new List<string>();

        var highPriorityTickets = tickets.Where(t => t.Priority == "High" || t.Priority == "Critical").ToList();
        if (highPriorityTickets.Any())
        {
            actionItems.Add($"Review {highPriorityTickets.Count} high priority tickets");
        }

        var prsNeedingReview = prs.Where(pr => pr.CommentsCount > 0 && pr.Status == "OPEN").ToList();
        if (prsNeedingReview.Any())
        {
            actionItems.Add($"Address comments on {prsNeedingReview.Count} PRs");
        }

        return actionItems;
    }

    private string GenerateBasicNextSteps(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        if (tickets.Any(t => t.Priority == "Critical"))
            return "Focus on critical priority tickets first";

        if (prs.Any(pr => pr.CommentsCount > 0))
            return "Address PR review comments";

        return "Continue with current work progress";
    }

    private async Task SaveWorkSummaryAsync(WorkSummaryModel summaryModel, Guid projectId)
    {
        var syncDate = summaryModel.SyncDate.Date;

        var existingWorkSummary = await _taskDbContext.WorkSummaries
            .FirstOrDefaultAsync(ws => ws.ProjectId == projectId && ws.SyncDate.Date == syncDate);

        var serializedTickets = JsonSerializer.Serialize(summaryModel.ActiveTickets);
        var serializedPRs = JsonSerializer.Serialize(summaryModel.ActivePRs);
        var serializedActionItems = JsonSerializer.Serialize(summaryModel.ActionItems);
        var serializedAiSuggestions = JsonSerializer.Serialize(summaryModel.AISuggestions);

        if (existingWorkSummary != null)
        {
            existingWorkSummary.SyncDate = summaryModel.SyncDate;
            existingWorkSummary.TicketsJson = serializedTickets;
            existingWorkSummary.PRsJson = serializedPRs;
            existingWorkSummary.ActionItemsJson = serializedActionItems;
            existingWorkSummary.NextSteps = summaryModel.NextSteps;
            existingWorkSummary.AISummary = summaryModel.AISummary;
            existingWorkSummary.ProductivityInsights = summaryModel.ProductivityInsights;
            existingWorkSummary.RiskAnalysis = summaryModel.RiskAnalysis;
            existingWorkSummary.ProductivityScore = summaryModel.ProductivityScore;
            existingWorkSummary.AISuggestions = serializedAiSuggestions;

            _logger.LogInformation(
                "Work summary updated for project {ProjectId} on {Date} with {TicketCount} tickets and {PRCount} PRs",
                projectId, syncDate, summaryModel.ActiveTickets.Count, summaryModel.ActivePRs.Count);
        }
        else
        {
            var newSummary = new WorkSummary
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                SyncDate = summaryModel.SyncDate,
                TicketsJson = serializedTickets,
                PRsJson = serializedPRs,
                ActionItemsJson = serializedActionItems,
                NextSteps = summaryModel.NextSteps,
                AISummary = summaryModel.AISummary,
                ProductivityInsights = summaryModel.ProductivityInsights,
                RiskAnalysis = summaryModel.RiskAnalysis,
                ProductivityScore = summaryModel.ProductivityScore,
                AISuggestions = serializedAiSuggestions,
                CreatedAt = DateTime.UtcNow
            };

            _taskDbContext.WorkSummaries.Add(newSummary);

            _logger.LogInformation(
                "Work summary created for project {ProjectId} on {Date} with {TicketCount} tickets and {PRCount} PRs",
                projectId, syncDate, summaryModel.ActiveTickets.Count, summaryModel.ActivePRs.Count);
        }

        await _taskDbContext.SaveChangesAsync(CancellationToken.None);
    }
}