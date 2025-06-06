using System;
using System.Collections.Generic;

namespace TaskConnect.TaskSchedulerService.Services;

public class JiraSearchResponse
{
    public List<JiraIssue> Issues { get; set; } = new List<JiraIssue>();
}

public class JiraIssue
{
    public string Key { get; set; }
    public JiraFields Fields { get; set; }
}

public class JiraFields
{
    public string Summary { get; set; }
    public JiraStatus Status { get; set; }
    public JiraPriority Priority { get; set; }
    public string Description { get; set; }
    public JiraUser Assignee { get; set; }
    public DateTime? Updated { get; set; }
    public List<string> Labels { get; set; }
}

public class JiraStatus
{
    public string Name { get; set; }
}

public class JiraPriority
{
    public string Name { get; set; }
}

public class JiraUser
{
    public string DisplayName { get; set; }
}