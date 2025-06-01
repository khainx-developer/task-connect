namespace TaskConnect.Infrastructure.Core;

public interface IVaultSecretProvider
{
    Task<string> GetSecretAsync(string environment, string path, string key);
}