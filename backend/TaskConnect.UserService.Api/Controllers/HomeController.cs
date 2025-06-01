using Microsoft.AspNetCore.Mvc;

namespace TaskConnect.UserService.Api.Controllers;

[ApiController]
[Route("")]
public class HomeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Welcome to User Service API! Navigate to /swagger for API documentation.");
    }
}