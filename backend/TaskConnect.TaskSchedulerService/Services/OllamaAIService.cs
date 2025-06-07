using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TaskConnect.TaskSchedulerService.Models;

namespace TaskConnect.TaskSchedulerService.Services;

public class OllamaAIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OllamaAIService> _logger;
    private readonly string _model;

    public OllamaAIService(HttpClient httpClient, ILogger<OllamaAIService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _model = Environment.GetEnvironmentVariable("AI_SETTINGS_MODEL") ?? "llama3.2";

        var aiBaseUrl = Environment.GetEnvironmentVariable("AI_SETTINGS_BASEURL") ?? "http://localhost:11434";
        _httpClient.BaseAddress = new Uri(aiBaseUrl);
        _httpClient.Timeout = TimeSpan.FromMinutes(2);
    }

    public async Task<string> GenerateWorkSummaryAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        var prompt = $@"
As a senior software development manager, analyze this developer's current work status and provide a concise executive summary.

CURRENT WORK DATA:
Active Jira Tickets ({tickets.Count}):
{string.Join("\n", tickets.Select(t => $"- {t.Key}: {t.Summary} [{t.Status}] - Priority: {t.Priority}"))}

Active Pull Requests ({prs.Count}):
{string.Join("\n", prs.Select(pr => $"- PR #{pr.Id}: {pr.Title} [{pr.Status}] - {pr.CommentsCount} comments"))}

Provide a 2-3 sentence executive summary focusing on:
1. Overall progress and workload
2. Key achievements and challenges
3. Current focus areas

Keep it professional and actionable.";

        return await CallAIAsync(prompt);
    }

    public async Task<List<string>> GenerateSuggestionsAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        var prompt = $@"
As a productivity coach for software developers, analyze this work data and provide 3-5 specific, actionable suggestions.

WORK DATA:
Tickets: {string.Join("; ", tickets.Select(t => $"{t.Key}({t.Status},{t.Priority})"))}
PRs: {string.Join("; ", prs.Select(pr => $"#{pr.Id}({pr.Status},{pr.CommentsCount}comments)"))}

Focus on:
- Time management and prioritization
- Code review efficiency
- Technical debt reduction
- Process improvements

Format as a numbered list of specific actions.";

        var response = await CallAIAsync(prompt);
        return ParseListResponse(response);
    }

    public async Task<string> GenerateProductivityInsightsAsync(List<JiraTicket> tickets,
        List<BitbucketPullRequest> prs)
    {
        var prompt = $@"
Analyze this developer's productivity patterns and provide insights.

DATA ANALYSIS:
- Total active tickets: {tickets.Count}
- High priority tickets: {tickets.Count(t => t.Priority == "High" || t.Priority == "Critical")}
- In-progress tickets: {tickets.Count(t => t.Status?.Contains("Progress") == true)}
- Active PRs: {prs.Count}
- PRs with comments: {prs.Count(pr => pr.CommentsCount > 0)}
- Recent PR activity: {prs.Count(pr => pr.Updated > DateTime.Now.AddDays(-2))}

Provide insights about:
1. Work distribution and balance
2. Collaboration patterns
3. Potential bottlenecks
4. Efficiency opportunities

Keep it concise and data-driven.";

        return await CallAIAsync(prompt);
    }

    public async Task<string> GenerateRiskAnalysisAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        var criticalTickets = tickets.Count(t => t.Priority == "Critical");
        var stalePRs = prs.Count(pr => pr.Updated < DateTime.Now.AddDays(-7));
        var highCommentPRs = prs.Count(pr => pr.CommentsCount > 5);

        var prompt = $@"
Perform a risk analysis for this developer's current workload.

RISK INDICATORS:
- Critical priority tickets: {criticalTickets}
- Stale PRs (>7 days): {stalePRs}
- PRs with many comments (>5): {highCommentPRs}
- Total workload: {tickets.Count} tickets, {prs.Count} PRs

Identify potential risks:
1. Delivery risks
2. Quality risks
3. Burnout risks
4. Process risks

Provide mitigation strategies for each identified risk.";

        return await CallAIAsync(prompt);
    }

    public async Task<int> CalculateProductivityScoreAsync(List<JiraTicket> tickets, List<BitbucketPullRequest> prs)
    {
        var prompt = $@"
Calculate a productivity score (0-100) based on this developer's work metrics.

METRICS:
- Active tickets: {tickets.Count}
- Completed this week: {tickets.Count(t => t.Updated > DateTime.Now.AddDays(-7) && t.Status == "Done")}
- High priority tickets: {tickets.Count(t => t.Priority == "High" || t.Priority == "Critical")}
- Active PRs: {prs.Count}
- Recent PR activity: {prs.Count(pr => pr.Updated > DateTime.Now.AddDays(-3))}
- PRs awaiting review: {prs.Count(pr => pr.Status == "OPEN" && pr.CommentsCount == 0)}

Consider:
- Workload balance (not overloaded, not underutilized)
- Progress velocity
- Code review engagement
- Priority focus

Return only a number between 0-100.";

        var response = await CallAIAsync(prompt);
        if (int.TryParse(response.Trim(), out int score))
        {
            return Math.Max(0, Math.Min(100, score));
        }

        return 75; // Default fallback score
    }

    private async Task<string> CallAIAsync(string prompt)
    {
        try
        {
            var request = new
            {
                model = _model,
                prompt = prompt,
                stream = false,
                options = new
                {
                    temperature = 0.7,
                    top_p = 0.9,
                    max_tokens = 500
                }
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/generate", content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI service returned {StatusCode}: {Content}",
                    response.StatusCode, await response.Content.ReadAsStringAsync());
                return "AI service unavailable";
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var ollamaResponse = JsonSerializer.Deserialize<OllamaResponse>(responseContent);

            return ollamaResponse?.Response ?? "No response generated";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AI service");
            return "AI analysis unavailable";
        }
    }

    private List<string> ParseListResponse(string response)
    {
        if (string.IsNullOrEmpty(response))
            return new List<string>();

        return response
            .Split('\n')
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Select(line => line.Trim().TrimStart('1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-', ' '))
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .ToList();
    }
}