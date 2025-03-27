using ezApps.IdentityService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ezApps.IdentityService.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<UserProduct> UserProducts { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}