namespace TaskConnect.Infrastructure.Core;

public interface IVaultSecretProvider
{
    Task<string> GetSecretAsync(string path, string key);
    Task<T> GetJsonSecretAsync<T>(string path);
    Task WriteJsonSecretAsync<T>(string path, T value);
}