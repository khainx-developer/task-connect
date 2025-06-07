using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TaskConnect.TaskSchedulerService.Models;

public class JiraSearchResponse
{
    [JsonPropertyName("issues")] public List<JiraIssue> Issues { get; set; } = new List<JiraIssue>();
}

public class JiraIssue
{
    [JsonPropertyName("key")] public string Key { get; set; }

    [JsonPropertyName("fields")] public JiraFields Fields { get; set; }
}

public class JiraFields
{
    [JsonPropertyName("summary")] public string Summary { get; set; }
    [JsonPropertyName("status")] public JiraStatus Status { get; set; }

    [JsonPropertyName("priority")] public JiraPriority Priority { get; set; }

    [JsonPropertyName("description")]
    [JsonConverter(typeof(DescriptionConverter))]
    public string Description { get; set; }

    [JsonPropertyName("assignee")] public JiraUser Assignee { get; set; }

    [JsonPropertyName("updated")] public string UpdatedText { get; set; }

    public DateTime? Updated => DateTime.TryParse(UpdatedText, out var date) ? date : null;

    [JsonPropertyName("lables")] public List<string> Labels { get; set; }
}

public class JiraStatus
{
    [JsonPropertyName("name")] public string Name { get; set; }
}

public class JiraPriority
{
    [JsonPropertyName("name")] public string Name { get; set; }
}

public class JiraUser
{
    [JsonPropertyName("displayName")] public string DisplayName { get; set; }
}