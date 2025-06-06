using System.Text.Json.Serialization;

namespace TaskConnect.Infrastructure.Core.Models;

public class ScheduleConfig
{
    [JsonPropertyName("scheduler")]
    public string Scheduler { get; set; }
    [JsonPropertyName("password")]
    public string Password { get; set; }
    [JsonPropertyName("username")]
    public string Username { get; set; }
}