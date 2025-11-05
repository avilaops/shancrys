using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using RabbitMQ.Client;
using Shancrys.Api.Configuration;
using System.Diagnostics;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/health")]
public class HealthController : ControllerBase
{
    private readonly IMongoClient _mongoClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        IMongoClient mongoClient,
        IConfiguration configuration,
        ILogger<HealthController> logger)
    {
        _mongoClient = mongoClient;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<HealthCheckResponse>> GetHealth()
    {
        var response = new HealthCheckResponse
        {
            Status = "healthy",
            Timestamp = DateTime.UtcNow,
            Services = new Dictionary<string, ServiceHealthStatus>()
        };

        var overallHealthy = true;

        // Check MongoDB
        var mongoHealth = await CheckMongoDbHealthAsync();
        response.Services["mongodb"] = mongoHealth;
        if (!mongoHealth.Healthy)
            overallHealthy = false;

        // Check RabbitMQ
        var rabbitMqHealth = CheckRabbitMqHealth();
        response.Services["rabbitmq"] = rabbitMqHealth;
        if (!rabbitMqHealth.Healthy)
            overallHealthy = false;

        // Check Redis (if configured)
        var redisHealth = CheckRedisHealth();
        if (redisHealth != null)
        {
            response.Services["redis"] = redisHealth;
            if (!redisHealth.Healthy)
                overallHealthy = false;
        }

        response.Status = overallHealthy ? "healthy" : "degraded";

        return overallHealthy ? Ok(response) : StatusCode(503, response);
    }

    [HttpGet("mongodb")]
    public async Task<ActionResult<ServiceHealthStatus>> GetMongoDbHealth()
    {
        var health = await CheckMongoDbHealthAsync();
        return health.Healthy ? Ok(health) : StatusCode(503, health);
    }

    [HttpGet("rabbitmq")]
    public ActionResult<ServiceHealthStatus> GetRabbitMqHealth()
    {
        var health = CheckRabbitMqHealth();
        return health.Healthy ? Ok(health) : StatusCode(503, health);
    }

    [HttpGet("redis")]
    public ActionResult<ServiceHealthStatus> GetRedisHealth()
    {
        var health = CheckRedisHealth();
        if (health == null)
        {
            return NotFound(new { message = "Redis is not configured" });
        }
        return health.Healthy ? Ok(health) : StatusCode(503, health);
    }

    private async Task<ServiceHealthStatus> CheckMongoDbHealthAsync()
    {
        var stopwatch = Stopwatch.StartNew();
        var status = new ServiceHealthStatus
        {
            Name = "MongoDB",
            Healthy = false
        };

        try
        {
            var mongoSettings = _configuration.GetSection("MongoDb").Get<MongoDbSettings>();
            if (mongoSettings == null || string.IsNullOrEmpty(mongoSettings.ConnectionString))
            {
                status.Error = "MongoDB configuration is missing or invalid";
                _logger.LogWarning("MongoDB configuration is missing");
                return status;
            }

            // Ping MongoDB
            var database = _mongoClient.GetDatabase(mongoSettings.DatabaseName);
            await database.RunCommandAsync<MongoDB.Bson.BsonDocument>(new MongoDB.Bson.BsonDocument("ping", 1));
            
            stopwatch.Stop();
            status.Healthy = true;
            status.ResponseTime = $"{stopwatch.ElapsedMilliseconds}ms";
            status.Details = new Dictionary<string, string>
            {
                ["database"] = mongoSettings.DatabaseName,
                ["status"] = "connected"
            };
            
            _logger.LogInformation("MongoDB health check passed in {ResponseTime}ms", stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            status.Error = $"Connection failed: {ex.Message}";
            status.ResponseTime = $"{stopwatch.ElapsedMilliseconds}ms";
            _logger.LogError(ex, "MongoDB health check failed");
        }

        return status;
    }

    private ServiceHealthStatus CheckRabbitMqHealth()
    {
        var stopwatch = Stopwatch.StartNew();
        var status = new ServiceHealthStatus
        {
            Name = "RabbitMQ",
            Healthy = false
        };

        try
        {
            var rabbitMqSettings = _configuration.GetSection("RabbitMQ").Get<RabbitMqSettings>();
            if (rabbitMqSettings == null || string.IsNullOrEmpty(rabbitMqSettings.HostName))
            {
                status.Error = "RabbitMQ configuration is missing or invalid";
                _logger.LogWarning("RabbitMQ configuration is missing");
                return status;
            }

            // Note: This creates a new connection for each health check.
            // For production, consider implementing connection pooling or a singleton
            // connection manager to reduce overhead under high load.
            var factory = new ConnectionFactory
            {
                HostName = rabbitMqSettings.HostName,
                Port = rabbitMqSettings.Port,
                UserName = rabbitMqSettings.UserName,
                Password = rabbitMqSettings.Password,
                RequestedConnectionTimeout = TimeSpan.FromSeconds(5),
                AutomaticRecoveryEnabled = false
            };

            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                // Just test the connection
                stopwatch.Stop();
                status.Healthy = true;
                status.ResponseTime = $"{stopwatch.ElapsedMilliseconds}ms";
                status.Details = new Dictionary<string, string>
                {
                    ["host"] = rabbitMqSettings.HostName,
                    ["port"] = rabbitMqSettings.Port.ToString(),
                    ["status"] = "connected"
                };
                
                _logger.LogInformation("RabbitMQ health check passed in {ResponseTime}ms", stopwatch.ElapsedMilliseconds);
            }
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            status.Error = $"Connection failed: {ex.Message}";
            status.ResponseTime = $"{stopwatch.ElapsedMilliseconds}ms";
            _logger.LogError(ex, "RabbitMQ health check failed");
        }

        return status;
    }

    private ServiceHealthStatus? CheckRedisHealth()
    {
        var redisConnectionString = _configuration.GetConnectionString("Redis");
        if (string.IsNullOrEmpty(redisConnectionString))
        {
            // Redis is optional, not configured
            _logger.LogDebug("Redis is not configured");
            return null;
        }

        // Redis health check not implemented yet
        // When needed, add StackExchange.Redis package and implement proper health check
        var status = new ServiceHealthStatus
        {
            Name = "Redis",
            Healthy = false,
            Error = "Redis health check requires StackExchange.Redis package to be implemented",
            Details = new Dictionary<string, string>
            {
                ["status"] = "not_implemented",
                ["message"] = "Add StackExchange.Redis NuGet package to enable this health check"
            }
        };
        
        _logger.LogDebug("Redis health check not implemented - StackExchange.Redis package required");
        return status;
    }
}

public class HealthCheckResponse
{
    public required string Status { get; set; }
    public DateTime Timestamp { get; set; }
    public required Dictionary<string, ServiceHealthStatus> Services { get; set; }
}

public class ServiceHealthStatus
{
    public required string Name { get; set; }
    public bool Healthy { get; set; }
    public string? ResponseTime { get; set; }
    public string? Error { get; set; }
    public Dictionary<string, string>? Details { get; set; }
}
