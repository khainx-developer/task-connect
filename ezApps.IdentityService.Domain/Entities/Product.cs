using System.ComponentModel.DataAnnotations;

namespace ezApps.IdentityService.Domain.Entities;

public class Product
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; }

    public List<UserProduct> UserProducts { get; set; } = new();
    public List<Role> Roles { get; set; } = new();
}