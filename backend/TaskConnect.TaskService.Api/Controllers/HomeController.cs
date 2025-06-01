using Microsoft.AspNetCore.Mvc;

namespace TaskConnect.TaskService.Api.Controllers;

[Route("")]
[ApiController]
public class HomeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Welcome to Task Service API! Navigate to /swagger for API documentation.");
    }
}