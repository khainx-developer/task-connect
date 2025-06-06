using Microsoft.EntityFrameworkCore;
using TaskConnect.UserService.Domain.Entities;

namespace TaskConnect.UserService.Domain.Common.Interfaces;

public interface IApplicationDbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<UserSetting> UserSettings { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<UserProduct> UserProducts { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}