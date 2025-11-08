using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Shancrys.Api.Data;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/[controller]")] // Mudado de [controller] para api/[controller]
public class HealthController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(IMongoDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            // Verificar conexão com MongoDB
            await _context.Users.CountDocumentsAsync(Builders<Shancrys.Api.Models.User>.Filter.Empty);
            
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                version = "1.0.0",
                service = "shancrys-api",
                checks = new
                {
                    database = "ok",
                    api = "ok"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(503, new
            {
                status = "unhealthy",
                timestamp = DateTime.UtcNow,
                error = ex.Message
            });
        }
    }

    [HttpGet("ready")]
    public IActionResult Ready()
    {
        return Ok(new { status = "ready", timestamp = DateTime.UtcNow });
    }

    [HttpGet("live")]
    public IActionResult Live()
    {
        return Ok(new { status = "live", timestamp = DateTime.UtcNow });
    }
}
