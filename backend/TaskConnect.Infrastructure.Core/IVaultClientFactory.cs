using VaultSharp;

namespace TaskConnect.Infrastructure.Core;

public interface IVaultClientFactory
{
    IVaultClient CreateClient();
}
