using System.Text.Json.Serialization;

namespace TaskConnect.Infrastructure.Core.Models;

public class DatabaseConfig
{
    [JsonPropertyName("database")]
    public string Database { get; set; }
    [JsonPropertyName("host")]
    public string Host { get; set; }
    [JsonPropertyName("password")]
    public string Password { get; set; }
    [JsonPropertyName("port")]
    public string Port { get; set; }
    [JsonPropertyName("username")]
    public string Username { get; set; }
}