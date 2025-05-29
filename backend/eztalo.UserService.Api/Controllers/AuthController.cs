using eztalo.UserService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eztalo.UserService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Authorize]
    [HttpPost("verify-user")]
    public async Task<ActionResult<User>> VerifyUser()
    {
        var authUid = User.Claims.SingleOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var email = User.Claims.SingleOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
        var name = User.Claims.SingleOrDefault(c => c.Type == "name")?.Value ?? "New User";
        if (string.IsNullOrEmpty(authUid) || string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Invalid user data" });

        // Check if user exists
        // Create new user
        var user = await _mediator.Send(new GetUserByUidQuery(authUid)) ??
                   await _mediator.Send(new CreateUserCommand(authUid, email, name));

        return Ok(user);
    }
}