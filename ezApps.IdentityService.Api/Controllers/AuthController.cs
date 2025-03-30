using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Mvc;

namespace ezApps.IdentityService.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok(new { status = "Identity Service is running" });
        }

        [HttpPost("verify-token")]
        public async Task<IActionResult> VerifyFirebaseToken([FromBody] VerifyTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.IdToken))
                return BadRequest("Token is required");

            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(request.IdToken);
                var uid = decodedToken.Uid;
                return Ok(new { UserId = uid });
            }
            catch
            {
                return Unauthorized("Invalid token");
            }
        }
    }

    public class VerifyTokenRequest
    {
        public string IdToken { get; set; }
    }
}