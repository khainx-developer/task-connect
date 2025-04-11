using System.ComponentModel.DataAnnotations;

namespace eztalo.UserService.Domain.Entities
{
    public class User
    {
        [Key]
        public string Id { get; set; } // Firebase UID

        [Required]
        public string Email { get; set; }

        public string DisplayName { get; set; }

        public List<UserProduct> UserProducts { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}