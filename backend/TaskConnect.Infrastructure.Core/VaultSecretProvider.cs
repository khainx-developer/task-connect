using VaultSharp;
using System.Text.Json;

namespace TaskConnect.Infrastructure.Core;

public class VaultSecretProvider : IVaultSecretProvider, IDisposable
{
    private readonly IVaultClient _vaultClient;
    private readonly SemaphoreSlim _lock = new(1, 1);

    private readonly Dictionary<string, (string value, DateTime lastFetched)> _cache = new();
    private readonly TimeSpan _refreshInterval = TimeSpan.FromMinutes(5);

    public VaultSecretProvider(IVaultClientFactory factory)
    {
        _vaultClient = factory.CreateClient();
    }

    public async Task<string> GetSecretAsync(string path, string key)
    {
        var fullPath = $"secret/data/{path}";
        var cacheKey = $"{path}:{key}";

        if (_cache.TryGetValue(cacheKey, out var cached) &&
            DateTime.UtcNow - cached.lastFetched < _refreshInterval)
        {
            return cached.value;
        }

        await _lock.WaitAsync();
        try
        {
            // Check again after acquiring lock (double-checked locking)
            if (_cache.TryGetValue(cacheKey, out cached) &&
                DateTime.UtcNow - cached.lastFetched < _refreshInterval)
            {
                return cached.value;
            }

            var secret = await _vaultClient.V1.Secrets.KeyValue.V2.ReadSecretAsync(
                path: path,
                mountPoint: "secret"
            );

            var data = secret.Data.Data;

            if (!data.TryGetValue(key, out var rawValue))
                throw new KeyNotFoundException($"Key '{key}' not found at Vault path '{fullPath}'.");

            var value = rawValue?.ToString() ?? string.Empty;

            _cache[cacheKey] = (value, DateTime.UtcNow);

            return value;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<T> GetJsonSecretAsync<T>(string path)
    {
        var fullPath = $"secret/data/{path}";
        var cacheKey = $"{path}:json";

        if (_cache.TryGetValue(cacheKey, out var cached) &&
            DateTime.UtcNow - cached.lastFetched < _refreshInterval)
        {
            return JsonSerializer.Deserialize<T>(cached.value)!;
        }

        await _lock.WaitAsync();
        try
        {
            // Check again after acquiring lock (double-checked locking)
            if (_cache.TryGetValue(cacheKey, out cached) &&
                DateTime.UtcNow - cached.lastFetched < _refreshInterval)
            {
                return JsonSerializer.Deserialize<T>(cached.value)!;
            }

            var secret = await _vaultClient.V1.Secrets.KeyValue.V2.ReadSecretAsync(
                path: path,
                mountPoint: "secret"
            );

            var jsonString = JsonSerializer.Serialize(secret.Data.Data);
            _cache[cacheKey] = (jsonString, DateTime.UtcNow);

            return JsonSerializer.Deserialize<T>(jsonString)!;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
        finally
        {
            _lock.Release();
        }
    }

    public void Dispose()
    {
        _lock.Dispose();
    }
}