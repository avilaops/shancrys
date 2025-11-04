using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shancrys.Api.Data;
using Shancrys.Api.Middleware;
using Shancrys.Api.Models;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly ShancrysDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ProgressController> _logger;

    public ProgressController(
        ShancrysDbContext context,
        ITenantService tenantService,
        ILogger<ProgressController> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProgressRecord>>> GetProgressRecords(
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? activityId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var query = _context.ProgressRecords.AsQueryable();

        if (projectId.HasValue)
        {
            var activityIds = await _context.Activities
                .Where(a => a.ProjectId == projectId.Value && a.Project.TenantId == tenantId)
                .Select(a => a.Id)
                .ToListAsync();
            
            query = query.Where(p => activityIds.Contains(p.ActivityId));
        }

        if (activityId.HasValue)
        {
            query = query.Where(p => p.ActivityId == activityId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(p => p.Timestamp >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(p => p.Timestamp <= endDate.Value);
        }

        var records = await query
            .OrderByDescending(p => p.Timestamp)
            .Take(100)
            .ToListAsync();

        return Ok(records);
    }

    [HttpPost]
    public async Task<ActionResult<ProgressRecord>> CreateProgressRecord([FromBody] CreateProgressDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var activity = await _context.Activities
            .Include(a => a.Project)
            .FirstOrDefaultAsync(a => a.Id == dto.ActivityId && a.Project.TenantId == tenantId);

        if (activity == null)
        {
            return NotFound("Atividade não encontrada");
        }

        var record = new ProgressRecord
        {
            Id = Guid.NewGuid(),
            ActivityId = dto.ActivityId,
            ElementId = dto.ElementId,
            Timestamp = DateTime.UtcNow,
            Type = dto.Type,
            Value = dto.Value,
            MediaUrl = dto.MediaUrl,
            GeoLocation = dto.GeoLocation,
            Author = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString())
        };

        _context.ProgressRecords.Add(record);

        // Atualizar progresso da atividade
        if (dto.Type == ProgressType.Percentage && dto.Value.HasValue)
        {
            activity.ProgressPercent = (decimal)dto.Value.Value;
            
            // Atualizar status
            if (activity.ProgressPercent >= 100)
            {
                activity.Status = ActivityStatus.Completed;
                activity.ActualEndDate = DateTime.UtcNow;
            }
            else if (activity.ProgressPercent > 0 && activity.Status == ActivityStatus.NotStarted)
            {
                activity.Status = ActivityStatus.InProgress;
                activity.ActualStartDate = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Progress record {RecordId} created for activity {ActivityId}", 
            record.Id, dto.ActivityId);

        return CreatedAtAction(nameof(GetProgressRecords), 
            new { activityId = dto.ActivityId }, 
            record);
    }

    [HttpPost("photo")]
    [RequestSizeLimit(20_000_000)] // 20MB
    public async Task<ActionResult<ProgressRecord>> UploadProgressPhoto(
        [FromForm] Guid activityId,
        [FromForm] IFormFile photo,
        [FromForm] double? latitude,
        [FromForm] double? longitude,
        [FromForm] string? notes)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var activity = await _context.Activities
            .Include(a => a.Project)
            .FirstOrDefaultAsync(a => a.Id == activityId && a.Project.TenantId == tenantId);

        if (activity == null)
        {
            return NotFound("Atividade não encontrada");
        }

        if (photo == null || photo.Length == 0)
        {
            return BadRequest("Foto não fornecida");
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest("Formato não suportado. Use JPG ou PNG");
        }

        // Salvar foto
        var photosPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "progress", tenantId.ToString()!);
        Directory.CreateDirectory(photosPath);
        
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(photosPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await photo.CopyToAsync(stream);
        }

        var record = new ProgressRecord
        {
            Id = Guid.NewGuid(),
            ActivityId = activityId,
            Timestamp = DateTime.UtcNow,
            Type = ProgressType.Photo,
            MediaUrl = $"/uploads/progress/{tenantId}/{fileName}",
            GeoLocation = (latitude.HasValue && longitude.HasValue) 
                ? new Dictionary<string, object> 
                { 
                    { "lat", latitude.Value }, 
                    { "lng", longitude.Value },
                    { "notes", notes ?? "" }
                } 
                : null,
            Author = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString())
        };

        _context.ProgressRecords.Add(record);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProgressRecords), 
            new { activityId }, 
            record);
    }

    [HttpGet("analytics/{projectId}")]
    public async Task<ActionResult<ProgressAnalyticsDto>> GetProgressAnalytics(Guid projectId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.TenantId == tenantId);

        if (project == null)
        {
            return NotFound("Projeto não encontrado");
        }

        var activities = await _context.Activities
            .Where(a => a.ProjectId == projectId)
            .ToListAsync();

        var now = DateTime.UtcNow;

        // Calcular métricas
        var totalActivities = activities.Count;
        var completedActivities = activities.Count(a => a.Status == ActivityStatus.Completed);
        var inProgressActivities = activities.Count(a => a.Status == ActivityStatus.InProgress);
        var lateActivities = activities.Count(a => 
            a.PlannedEndDate < now && a.Status != ActivityStatus.Completed);

        var plannedProgress = CalculatePlannedProgress(activities, now);
        var actualProgress = activities.Any() 
            ? activities.Average(a => (double)a.ProgressPercent) 
            : 0;

        var spi = plannedProgress > 0 ? actualProgress / plannedProgress : 0;

        // Progresso por disciplina
        var mappings = await _context.ElementActivityMappings
            .Include(m => m.Element)
            .Include(m => m.Activity)
            .Where(m => m.Activity.ProjectId == projectId)
            .ToListAsync();

        var progressByDiscipline = mappings
            .GroupBy(m => m.Element.Discipline)
            .Select(g => new DisciplineProgressDto
            {
                Discipline = g.Key,
                TotalElements = g.Select(m => m.ElementId).Distinct().Count(),
                CompletedElements = g.Where(m => m.Activity.Status == ActivityStatus.Completed)
                    .Select(m => m.ElementId).Distinct().Count(),
                Progress = g.Average(m => (double)m.Activity.ProgressPercent)
            })
            .ToList();

        // Tendência de progresso (últimos 30 dias)
        var progressRecords = await _context.ProgressRecords
            .Where(p => activities.Select(a => a.Id).Contains(p.ActivityId))
            .Where(p => p.Type == ProgressType.Percentage)
            .Where(p => p.Timestamp >= now.AddDays(-30))
            .OrderBy(p => p.Timestamp)
            .ToListAsync();

        var progressTrend = progressRecords
            .GroupBy(p => p.Timestamp.Date)
            .Select(g => new ProgressTrendDto
            {
                Date = g.Key,
                AverageProgress = g.Average(p => p.Value ?? 0)
            })
            .ToList();

        return Ok(new ProgressAnalyticsDto
        {
            ProjectId = projectId,
            TotalActivities = totalActivities,
            CompletedActivities = completedActivities,
            InProgressActivities = inProgressActivities,
            LateActivities = lateActivities,
            PlannedProgress = plannedProgress,
            ActualProgress = actualProgress,
            SchedulePerformanceIndex = spi,
            ProgressByDiscipline = progressByDiscipline,
            ProgressTrend = progressTrend
        });
    }

    private double CalculatePlannedProgress(List<Activity> activities, DateTime asOfDate)
    {
        if (!activities.Any()) return 0;

        var totalDuration = activities.Sum(a => a.Duration);
        if (totalDuration == 0) return 0;

        var plannedDuration = 0;
        foreach (var activity in activities)
        {
            if (asOfDate >= activity.PlannedEndDate)
            {
                plannedDuration += activity.Duration;
            }
            else if (asOfDate > activity.PlannedStartDate)
            {
                var elapsed = (asOfDate - activity.PlannedStartDate).TotalDays;
                plannedDuration += (int)(elapsed / activity.Duration * activity.Duration);
            }
        }

        return (double)plannedDuration / totalDuration * 100;
    }
}

public record CreateProgressDto(
    Guid ActivityId,
    Guid? ElementId,
    ProgressType Type,
    double? Value,
    string? MediaUrl,
    Dictionary<string, object>? GeoLocation
);

public record ProgressAnalyticsDto
{
    public Guid ProjectId { get; init; }
    public int TotalActivities { get; init; }
    public int CompletedActivities { get; init; }
    public int InProgressActivities { get; init; }
    public int LateActivities { get; init; }
    public double PlannedProgress { get; init; }
    public double ActualProgress { get; init; }
    public double SchedulePerformanceIndex { get; init; }
    public List<DisciplineProgressDto> ProgressByDiscipline { get; init; } = new();
    public List<ProgressTrendDto> ProgressTrend { get; init; } = new();
}

public record DisciplineProgressDto
{
    public string Discipline { get; init; } = string.Empty;
    public int TotalElements { get; init; }
    public int CompletedElements { get; init; }
    public double Progress { get; init; }
}

public record ProgressTrendDto
{
    public DateTime Date { get; init; }
    public double AverageProgress { get; init; }
}
