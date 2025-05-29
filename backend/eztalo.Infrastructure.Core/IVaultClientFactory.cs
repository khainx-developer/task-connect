using VaultSharp;

namespace eztalo.Infrastructure.Core;

public interface IVaultClientFactory
{
    IVaultClient CreateClient();
}
