using System.ComponentModel.DataAnnotations;

namespace ezApps.IdentityService.Domain.Entities;

public class UserRole
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserProductId { get; set; }
    public UserProduct UserProduct { get; set; }

    [Required]
    public Guid RoleId { get; set; }
    public Role Role { get; set; }
}
