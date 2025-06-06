using System;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Http;

namespace TaskConnect.TaskSchedulerService;

public class HangfireCustomBasicAuthenticationFilter : IDashboardAuthorizationFilter
{
    public string User { get; set; }
    public string Pass { get; set; }

    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        string header = httpContext.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrWhiteSpace(header) || !header.StartsWith("Basic "))
        {
            SetChallengeResponse(httpContext);
            return false;
        }

        try
        {
            var authValues = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(header.Substring(6))).Split(':');
            if (authValues.Length != 2)
            {
                SetChallengeResponse(httpContext);
                return false;
            }

            if (authValues[0] == User && authValues[1] == Pass)
            {
                return true;
            }
        }
        catch
        {
            // Invalid base64 or other error
        }

        SetChallengeResponse(httpContext);
        return false;
    }

    private void SetChallengeResponse(HttpContext httpContext)
    {
        httpContext.Response.StatusCode = 401;
        httpContext.Response.Headers.Add("WWW-Authenticate", "Basic realm=\"Hangfire Dashboard\"");
    }
} 