using System.ComponentModel.DataAnnotations;

namespace eztalo.UserService.Domain.Entities;

public class UserProduct
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required] public string UserId { get; set; }
    public User User { get; set; }

    [Required] public Guid ProductId { get; set; }
    public Product Product { get; set; }

    public List<UserRole> UserRoles { get; set; } = new();
}