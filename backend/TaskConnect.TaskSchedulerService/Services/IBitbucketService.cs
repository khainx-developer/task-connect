using System.Collections.Generic;
using System.Threading.Tasks;
using TaskConnect.TaskSchedulerService.Models;

namespace TaskConnect.TaskSchedulerService.Services;

public interface IBitbucketService
{
    Task<List<BitbucketPullRequest>> GetPullRequestsAsync(string workspace, string repository);
    Task<List<BitbucketPullRequest>> GetPullRequestsByAuthorAsync(string workspace, string repository, string author);
}