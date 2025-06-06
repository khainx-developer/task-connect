using System;
using System.Collections.Generic;

namespace TaskConnect.TaskSchedulerService.Models;

public class JiraTicket
{
    public string Key { get; set; }
    public string Summary { get; set; }
    public string Status { get; set; }
    public string Priority { get; set; }
    public string Description { get; set; }
    public string Assignee { get; set; }
    public DateTime? Updated { get; set; }
    public List<string> Labels { get; set; } = new List<string>();
}