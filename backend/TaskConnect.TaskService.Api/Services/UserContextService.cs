namespace TaskConnect.TaskService.Api.Services;

public interface IUserContextService
{
    string UserId { get; }
}

public class UserContextService : IUserContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContextService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string UserId => _httpContextAccessor.HttpContext?.User.Claims.SingleOrDefault(c => c.Type == "sid")?.Value;
}