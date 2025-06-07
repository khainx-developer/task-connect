using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
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
    private readonly HttpClient _httpClient;

    public DataSyncJob(ILogger<DataSyncJob> logger,
        IVaultSecretProvider vaultSecretProvider, IApplicationDbContext taskDbContext,
        UserService.Domain.Common.Interfaces.IApplicationDbContext userDbContext, HttpClient httpClient)
    {
        _logger = logger;
        _vaultSecretProvider = vaultSecretProvider;
        _taskDbContext = taskDbContext;
        _userDbContext = userDbContext;
        _httpClient = httpClient;
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
                foreach (var userSettingId in project.ProjectSettingIds)
                {
                    var userSetting = _userDbContext.UserSettings.SingleOrDefault(ps => ps.Id == userSettingId);
                    if (userSetting == null)
                    {
                        continue;
                    }

                    try
                    {
                        List<JiraTicket> jiraTickets = null;
                        List<BitbucketPullRequest> pullRequests = null;
                        if (userSetting.Type == UserSettingType.Jira)
                        {
                            // Get Jira settings from Vault
                            var jiraSettings = await _vaultSecretProvider.GetJsonSecretAsync<JiraSettingsModel>(
                                $"data/user-settings/{project.OwnerId}/{userSetting.Id}");

                            // Fetch Jira tickets
                            var jiraUrl = $"https://{jiraSettings.JiraCloudDomain}";
                            IJiraService jiraService = new JiraService(jiraUrl,
                                jiraSettings.ApiToken, jiraSettings.AtlassianEmailAddress, _httpClient);
                            jiraTickets =
                                await jiraService.GetAssignedTicketsAsync(jiraSettings.AtlassianEmailAddress);
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
                                bitbucketSettings.Username, _httpClient);
                            // Fetch Bitbucket PRs
                            pullRequests = await bitbucketService.GetPullRequestsByAuthorAsync(
                                bitbucketSettings.Workspace,
                                bitbucketSettings.RepositorySlug,
                                bitbucketSettings.DefaultAuthor);
                            _logger.LogInformation("Fetched {Count} pull requests for project {ProjectId}",
                                pullRequests.Count, project.Id);
                        }


                        // Generate work summary
                        var workSummary = GenerateWorkSummary(jiraTickets, pullRequests);

                        // Save to your Eztalo app
                        await SaveWorkSummaryAsync(workSummary, project.Id);

                        _logger.LogInformation("Data sync completed successfully for project {ProjectId} at {Time}",
                            project.Id, DateTime.UtcNow);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error occurred during data sync for project {ProjectId}", project.Id);
                        // Continue with next project instead of failing the entire job
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during data sync");
            throw; // Re-throw to let Hangfire handle retry logic
        }
    }

    private Models.WorkSummary GenerateWorkSummary(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        tickets ??= [];
        prs ??= [];
        var summary = new Models.WorkSummary
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

    private async Task SaveWorkSummaryAsync(Models.WorkSummary summary, Guid projectId)
    {
        // Save to the task database
        var workSummaryEntity = new WorkSummary
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            SyncDate = summary.SyncDate,
            TicketsJson = JsonSerializer.Serialize(summary.ActiveTickets),
            PRsJson = JsonSerializer.Serialize(summary.ActivePRs),
            ActionItemsJson = JsonSerializer.Serialize(summary.ActionItems),
            NextSteps = summary.NextSteps,
            CreatedAt = DateTime.UtcNow
        };

        _taskDbContext.WorkSummaries.Add(workSummaryEntity);
        await _taskDbContext.SaveChangesAsync(CancellationToken.None);

        _logger.LogInformation(
            "Work summary saved for project {ProjectId} with {TicketCount} tickets and {PRCount} PRs",
            projectId, summary.ActiveTickets.Count, summary.ActivePRs.Count);
    }
}