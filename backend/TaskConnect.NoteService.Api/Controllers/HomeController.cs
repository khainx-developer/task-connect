using Microsoft.AspNetCore.Mvc;

namespace TaskConnect.NoteService.Api.Controllers;

[Route("")]
[ApiController]
public class HomeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Welcome to Note Service API! Navigate to /swagger for API documentation.");
    }
}