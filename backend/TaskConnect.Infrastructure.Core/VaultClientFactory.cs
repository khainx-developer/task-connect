using VaultSharp;
using VaultSharp.V1.AuthMethods.Token;

namespace TaskConnect.Infrastructure.Core;

public class VaultClientFactory : IVaultClientFactory
{
    private readonly string _vaultUri;
    private readonly string _vaultToken;

    public VaultClientFactory()
    {
        _vaultUri = Environment.GetEnvironmentVariable("VAULT_URI")!;
        _vaultToken = Environment.GetEnvironmentVariable("VAULT_TOKEN")!;
    }

    public IVaultClient CreateClient()
    {
        var vaultClientSettings = new VaultClientSettings(_vaultUri, new TokenAuthMethodInfo(_vaultToken))
        {
            // Optional: configure HttpClient, retry, etc.
        };

        return new VaultClient(vaultClientSettings);
    }
}