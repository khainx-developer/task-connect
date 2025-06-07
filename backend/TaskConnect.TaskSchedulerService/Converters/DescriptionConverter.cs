using System;
using System.Text.Json;
using System.Text.Json.Serialization;

public class DescriptionConverter : JsonConverter<string>
{
    public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            return reader.GetString();
        }

        if (reader.TokenType == JsonTokenType.StartObject)
        {
            using var doc = JsonDocument.ParseValue(ref reader);
            return ExtractTextFromADF(doc.RootElement);
        }

        return string.Empty;
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value);

    private string ExtractTextFromADF(JsonElement node)
    {
        var sb = new System.Text.StringBuilder();

        void Traverse(JsonElement element)
        {
            if (element.TryGetProperty("type", out var typeProp))
            {
                var type = typeProp.GetString();

                if (type == "text" && element.TryGetProperty("text", out var textProp))
                {
                    sb.Append(textProp.GetString());
                }
                else if (type == "paragraph" || type == "listItem")
                {
                    if (type == "listItem") sb.Append("- ");
                    if (element.TryGetProperty("content", out var content))
                        foreach (var child in content.EnumerateArray())
                            Traverse(child);
                    sb.AppendLine();
                }
                else if (type == "bulletList")
                {
                    if (element.TryGetProperty("content", out var items))
                        foreach (var item in items.EnumerateArray())
                            Traverse(item);
                }
                else if (element.TryGetProperty("content", out var content))
                {
                    foreach (var child in content.EnumerateArray())
                        Traverse(child);
                }
            }
        }

        Traverse(node);
        return sb.ToString().Trim();
    }
}