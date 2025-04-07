using ezApps.UserService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ezApps.UserService.Api.Controllers;

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
        var firebaseUid = User.FindFirst("user_id")?.Value;
        var email = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
        var name = User.FindFirst("name")?.Value ?? "New User";
        if (string.IsNullOrEmpty(firebaseUid) || string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Invalid Firebase user data" });

        // Check if user exists
        // Create new user
        var user = await _mediator.Send(new GetUserByFirebaseUidQuery(firebaseUid)) ??
                   await _mediator.Send(new CreateUserCommand(firebaseUid, email, name));

        return Ok(user);
    }
}