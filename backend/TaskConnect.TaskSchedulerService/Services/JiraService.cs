using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TaskConnect.TaskSchedulerService.Models;

namespace TaskConnect.TaskSchedulerService.Services;

public class JiraService : IJiraService
{
    private readonly HttpClient _httpClient;

    public JiraService(string jiraUrl, string token, string email)
    {
        _httpClient = new HttpClient();
        _httpClient.BaseAddress = new Uri(jiraUrl);
        var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{email}:{token}"));
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);
    }

    public async Task<List<JiraTicket>> GetAssignedTicketsAsync(string assignee)
    {
        var jql = $"assignee = '{assignee}' AND status != 'Done' ORDER BY updated DESC";
        return await GetTicketsByJqlAsync(jql);
    }

    public async Task<List<JiraTicket>> GetTicketsByJqlAsync(string jql)
    {
        try
        {
            var encodedJql = Uri.EscapeDataString(jql);
            var response = await _httpClient.GetAsync(
                $"/rest/api/3/search?jql={encodedJql}&fields=key,summary,status,priority,description,assignee,updated,labels");

            if (!response.IsSuccessStatusCode)
                return new List<JiraTicket>();

            var content = await response.Content.ReadAsStringAsync();
            var jiraResponse = JsonSerializer.Deserialize<JiraSearchResponse>(content);

            return jiraResponse.Issues.Select(issue => new JiraTicket
            {
                Key = issue.Key,
                Summary = issue.Fields.Summary,
                Status = issue.Fields.Status?.Name,
                Priority = issue.Fields.Priority?.Name,
                Description = issue.Fields.Description,
                Assignee = issue.Fields.Assignee?.DisplayName,
                Updated = issue.Fields.Updated,
                Labels = issue.Fields.Labels ?? new List<string>()
            }).ToList();
        }
        catch (Exception)
        {
            // Log exception
            return new List<JiraTicket>();
        }
    }
}