using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskConnect.Api.Core.Services;
using TaskConnect.UserService.Domain.Entities;

namespace TaskConnect.UserService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/auth")]
public class AuthController(IMediator mediator, IUserContextService userContextService) : ControllerBase
{
    [Authorize]
    [HttpPost("verify-user",Name = "Verify User")]
    public async Task<ActionResult<User>> VerifyUser()
    {
        var userClaimsInfo = userContextService.UserClaimsInfo;
        if (string.IsNullOrEmpty(userClaimsInfo.UserId) || string.IsNullOrEmpty(userClaimsInfo.Email))
            return BadRequest(new { message = "Invalid user data" });

        // Check if user exists
        // Create new user
        var user = await mediator.Send(new GetUserByUidQuery(userClaimsInfo.UserId)) ??
                   await mediator.Send(new CreateUserCommand(userClaimsInfo.UserId, userClaimsInfo.Email,
                       userClaimsInfo.Name));

        return Ok(user);
    }
}