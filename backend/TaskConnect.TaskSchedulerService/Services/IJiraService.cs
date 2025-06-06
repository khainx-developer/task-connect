using System.Collections.Generic;
using System.Threading.Tasks;
using TaskConnect.TaskSchedulerService.Models;

namespace TaskConnect.TaskSchedulerService.Services;

public interface IJiraService
{
    Task<List<JiraTicket>> GetAssignedTicketsAsync(string assignee);
    Task<List<JiraTicket>> GetTicketsByJqlAsync(string jql);
}