using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Shancrys.Api.Data;
using Shancrys.Api.Models;
using Shancrys.Api.Middleware;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ActivitiesController> _logger;

    public ActivitiesController(IMongoDbContext context, ITenantService tenantService, ILogger<ActivitiesController> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    private Guid GetTenantIdOrThrow()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            throw new UnauthorizedAccessException("TenantId não encontrado");
        return tenantId.Value;
    }

    /// <summary>
    /// Criar nova atividade no projeto
    /// </summary>
    // POST /api/projects/{id}/activities
    [HttpPost("projects/{projectId}/activities")]
    public async Task<IActionResult> CreateActivity(Guid projectId, [FromBody] ActivityCreateDto dto)
    {
        var tenantId = GetTenantIdOrThrow();
        var project = await _context.Projects.Find(p => p.Id == projectId && p.TenantId == tenantId).FirstOrDefaultAsync();
        if (project == null)
            return NotFound(new { message = "Projeto não encontrado" });

        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Wbs = dto.Wbs,
            WbsCode = dto.WbsCode,
            Name = dto.Name,
            Description = dto.Description,
            PlannedStartDate = dto.PlannedStartDate,
            PlannedEndDate = dto.PlannedEndDate,
            StartPlanned = dto.StartPlanned,
            EndPlanned = dto.EndPlanned,
            Duration = dto.Duration,
            Predecessors = dto.Predecessors ?? new List<string>(),
            Status = ActivityStatus.NotStarted,
            Metadata = dto.Metadata ?? new Dictionary<string, object>()
        };
        await _context.Activities.InsertOneAsync(activity);
        return CreatedAtAction(nameof(GetActivityById), new { id = activity.Id }, activity);
    }

    /// <summary>
    /// Listar todas as atividades de um projeto
    /// </summary>
    // GET /api/projects/{id}/activities
    [HttpGet("projects/{projectId}/activities")]
    public async Task<IActionResult> ListActivities(Guid projectId)
    {
        var tenantId = GetTenantIdOrThrow();
        var project = await _context.Projects.Find(p => p.Id == projectId && p.TenantId == tenantId).FirstOrDefaultAsync();
        if (project == null)
            return NotFound(new { message = "Projeto não encontrado" });
        var activities = await _context.Activities.Find(a => a.ProjectId == projectId).ToListAsync();
        return Ok(activities);
    }

    /// <summary>
    /// Obter detalhes de uma atividade específica
    /// </summary>
    // GET /api/activities/{id}
    [HttpGet("activities/{id}")]
    public async Task<IActionResult> GetActivityById(Guid id)
    {
        var activity = await _context.Activities.Find(a => a.Id == id).FirstOrDefaultAsync();
        if (activity == null)
            return NotFound(new { message = "Atividade não encontrada" });
        return Ok(activity);
    }

    /// <summary>
    /// Atualizar uma atividade
    /// </summary>
    // PUT /api/activities/{id}
    [HttpPut("activities/{id}")]
    public async Task<IActionResult> UpdateActivity(Guid id, [FromBody] ActivityUpdateDto dto)
    {
        var activity = await _context.Activities.Find(a => a.Id == id).FirstOrDefaultAsync();
        if (activity == null)
            return NotFound(new { message = "Atividade não encontrada" });
        var update = Builders<Activity>.Update
            .Set(a => a.Name, dto.Name ?? activity.Name)
            .Set(a => a.Description, dto.Description ?? activity.Description)
            .Set(a => a.PlannedStartDate, dto.PlannedStartDate ?? activity.PlannedStartDate)
            .Set(a => a.PlannedEndDate, dto.PlannedEndDate ?? activity.PlannedEndDate)
            .Set(a => a.Status, dto.Status ?? activity.Status)
            .Set(a => a.Duration, dto.Duration ?? activity.Duration)
            .Set(a => a.Predecessors, dto.Predecessors ?? activity.Predecessors)
            .Set(a => a.Metadata, dto.Metadata ?? activity.Metadata);
        await _context.Activities.UpdateOneAsync(a => a.Id == id, update);
        var updated = await _context.Activities.Find(a => a.Id == id).FirstOrDefaultAsync();
        return Ok(updated);
    }

    /// <summary>
    /// Deletar uma atividade
    /// </summary>
    // DELETE /api/activities/{id}
    [HttpDelete("activities/{id}")]
    public async Task<IActionResult> DeleteActivity(Guid id)
    {
        var result = await _context.Activities.DeleteOneAsync(a => a.Id == id);
        if (result.DeletedCount == 0)
            return NotFound(new { message = "Atividade não encontrada" });
        return NoContent();
    }

    /// <summary>
    /// Vincular elementos BIM a uma atividade
    /// </summary>
    // POST /api/activities/{id}/elements
    [HttpPost("activities/{id}/elements")]
    public async Task<IActionResult> LinkElements(Guid id, [FromBody] LinkElementsDto dto)
    {
        var activity = await _context.Activities.Find(a => a.Id == id).FirstOrDefaultAsync();
        if (activity == null)
            return NotFound(new { message = "Atividade não encontrada" });
        foreach (var elementId in dto.ElementIds)
        {
            var mapping = new ElementActivityMapping
            {
                Id = Guid.NewGuid(),
                ActivityId = id,
                ElementId = elementId,
                MappingType = dto.MappingType,
                Confidence = dto.Confidence,
                Weight = dto.Weight
            };
            await _context.ElementActivityMappings.InsertOneAsync(mapping);
        }
        return Ok(new { message = "Elementos vinculados com sucesso" });
    }
}

public class ActivityCreateDto
{
    public required string Wbs { get; set; }
    public required string WbsCode { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTime PlannedStartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime StartPlanned { get; set; }
    public DateTime EndPlanned { get; set; }
    public int Duration { get; set; }
    public List<string>? Predecessors { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

public class ActivityUpdateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateTime? PlannedStartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public ActivityStatus? Status { get; set; }
    public int? Duration { get; set; }
    public List<string>? Predecessors { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

public class LinkElementsDto
{
    public required List<Guid> ElementIds { get; set; }
    public MappingType MappingType { get; set; } = MappingType.Manual;
    public decimal Confidence { get; set; } = 1.0m;
    public double Weight { get; set; } = 1.0;
}
