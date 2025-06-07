using System.Text.Json.Serialization;

namespace TaskConnect.TaskSchedulerService.Models;

public class OllamaResponse
{
    [JsonPropertyName("response")]
    public string Response { get; set; }
    
    [JsonPropertyName("done")]
    public bool Done { get; set; }
}
