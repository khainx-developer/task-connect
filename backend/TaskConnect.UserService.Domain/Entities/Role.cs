using System.ComponentModel.DataAnnotations;

namespace TaskConnect.UserService.Domain.Entities;

public class Role
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; } // e.g., "Admin", "Viewer"

    [Required]
    public Guid ProductId { get; set; }
    public Product Product { get; set; }
}
