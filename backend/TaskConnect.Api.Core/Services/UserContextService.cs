using Microsoft.AspNetCore.Http;

namespace TaskConnect.Api.Core.Services;

public class UserClaimsInfo
{
    public string Name { get; set; }
    public string UserId { get; set; }
    public string Email { get; set; }
}

public interface IUserContextService
{
    string UserId { get; }

    UserClaimsInfo UserClaimsInfo { get; }
}

public class UserContextService(IHttpContextAccessor httpContextAccessor) : IUserContextService
{
    public string UserId => httpContextAccessor.HttpContext?.User.Claims.SingleOrDefault(c =>
        c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

    public UserClaimsInfo UserClaimsInfo
    {
        get
        {
            var authUid = httpContextAccessor.HttpContext?.User.Claims.SingleOrDefault(c =>
                c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            var email = httpContextAccessor.HttpContext?.User.Claims.SingleOrDefault(c =>
                c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
            var name = httpContextAccessor.HttpContext?.User.Claims.SingleOrDefault(c => c.Type == "name")?.Value;
            return new UserClaimsInfo()
            {
                UserId=authUid,
                Email = email,
                Name = name
            };
        }
    }
}