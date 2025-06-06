using System.ComponentModel.DataAnnotations;

namespace TaskConnect.UserService.Domain.Entities
{
    public class User
    {
        [Key] public string Id { get; set; } // UID

        [Required] public string Email { get; set; }

        public string DisplayName { get; set; }

        public List<UserProduct> UserProducts { get; set; } = new();

        public List<UserSetting> UserSettings { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}