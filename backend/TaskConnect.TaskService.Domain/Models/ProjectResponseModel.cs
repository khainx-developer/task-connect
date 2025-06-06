using System;
using System.Collections.Generic;

namespace TaskConnect.TaskService.Domain.Models;

public class ProjectResponseModel
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; }
    public string OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsArchived { get; set; }
    public List<ProjectSettingModel> ProjectSettings { get; set; } = new();
}

public class ProjectSettingModel
{
    public Guid Id { get; set; }
    public Guid UserSettingId { get; set; }
    public DateTime CreatedAt { get; set; }
}