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

public class BitbucketService : IBitbucketService
{
    private readonly HttpClient _httpClient;

    public BitbucketService(string token, string username, HttpClient httpClient)
    {
        _httpClient = httpClient;

        _httpClient.BaseAddress = new Uri("https://api.bitbucket.org/2.0/");
        var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{token}"));
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);
    }

    public async Task<List<BitbucketPullRequest>> GetPullRequestsAsync(string workspace, string repository)
    {
        try
        {
            var response = await _httpClient.GetAsync($"repositories/{workspace}/{repository}/pullrequests?state=OPEN");

            if (!response.IsSuccessStatusCode)
                return new List<BitbucketPullRequest>();

            var content = await response.Content.ReadAsStringAsync();
            var prResponse = JsonSerializer.Deserialize<BitbucketPRResponse>(content);

            return prResponse.Values.Select(pr => new BitbucketPullRequest
            {
                Id = pr.Id,
                Title = pr.Title,
                Status = pr.State,
                SourceBranch = pr.Source?.Branch?.Name,
                DestinationBranch = pr.Destination?.Branch?.Name,
                Author = pr.Author?.DisplayName,
                Created = pr.CreatedOn,
                Updated = pr.UpdatedOn,
                Reviewers = pr.Reviewers?.Select(r => r.DisplayName).ToList() ?? new List<string>(),
                CommentsCount = pr.CommentCount
            }).ToList();
        }
        catch (Exception ex)
        {
            // Log exception
            return new List<BitbucketPullRequest>();
        }
    }

    public async Task<List<BitbucketPullRequest>> GetPullRequestsByAuthorAsync(string workspace, string repository,
        string author)
    {
        var allPRs = await GetPullRequestsAsync(workspace, repository);
        return allPRs.Where(pr => pr.Author?.Equals(author, StringComparison.OrdinalIgnoreCase) == true).ToList();
    }
}