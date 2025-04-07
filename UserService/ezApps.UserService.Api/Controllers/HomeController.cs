using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ezApps.UserService.Api.Controllers;

[Authorize]
[ApiController]
[Route("")]
public class HomeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Welcome to Identity Service API! Navigate to /swagger for API documentation.");
    }
}