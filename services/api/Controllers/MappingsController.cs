using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shancrys.Api.Data;
using Shancrys.Api.Middleware;
using Shancrys.Api.Models;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/mappings")]
[Authorize]
public class MappingsController : ControllerBase
{
    private readonly ShancrysDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<MappingsController> _logger;

    public MappingsController(
        ShancrysDbContext context,
        ITenantService tenantService,
        ILogger<MappingsController> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<ElementActivityMapping>>> GetMappings(
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? activityId,
        [FromQuery] Guid? elementId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var query = _context.ElementActivityMappings
            .Include(m => m.Element)
            .ThenInclude(e => e.ModelVersion)
            .ThenInclude(mv => mv.Project)
            .Include(m => m.Activity)
            .ThenInclude(a => a.Project)
            .Where(m => m.Activity.Project.TenantId == tenantId);

        if (projectId.HasValue)
        {
            query = query.Where(m => m.Activity.ProjectId == projectId.Value);
        }

        if (activityId.HasValue)
        {
            query = query.Where(m => m.ActivityId == activityId.Value);
        }

        if (elementId.HasValue)
        {
            query = query.Where(m => m.ElementId == elementId.Value);
        }

        var mappings = await query.ToListAsync();

        return Ok(mappings);
    }

    [HttpPost]
    public async Task<ActionResult<ElementActivityMapping>> CreateMapping([FromBody] CreateMappingDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        // Validar elemento
        var element = await _context.Elements
            .Include(e => e.ModelVersion)
            .ThenInclude(m => m.Project)
            .FirstOrDefaultAsync(e => e.Id == dto.ElementId && e.ModelVersion.Project.TenantId == tenantId);

        if (element == null)
        {
            return NotFound("Elemento não encontrado");
        }

        // Validar atividade
        var activity = await _context.Activities
            .Include(a => a.Project)
            .FirstOrDefaultAsync(a => a.Id == dto.ActivityId && a.Project.TenantId == tenantId);

        if (activity == null)
        {
            return NotFound("Atividade não encontrada");
        }

        // Verificar se já existe mapeamento
        var existing = await _context.ElementActivityMappings
            .FirstOrDefaultAsync(m => m.ElementId == dto.ElementId && m.ActivityId == dto.ActivityId);

        if (existing != null)
        {
            return Conflict("Mapeamento já existe");
        }

        var mapping = new ElementActivityMapping
        {
            Id = Guid.NewGuid(),
            ElementId = dto.ElementId,
            ActivityId = dto.ActivityId,
            MappingType = dto.MappingType,
            Confidence = dto.Confidence,
            CreatedAt = DateTime.UtcNow
        };

        _context.ElementActivityMappings.Add(mapping);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Mapping created: Element {ElementId} -> Activity {ActivityId}", 
            dto.ElementId, dto.ActivityId);

        return CreatedAtAction(nameof(GetMappings), 
            new { elementId = dto.ElementId, activityId = dto.ActivityId }, 
            mapping);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult> CreateMappingsBulk([FromBody] List<CreateMappingDto> mappings)
    {
        var tenantId = _tenantService.GetCurrentTenantId();

        if (mappings == null || mappings.Count == 0)
        {
            return BadRequest("Nenhum mapeamento fornecido");
        }

        var elementIds = mappings.Select(m => m.ElementId).Distinct().ToList();
        var activityIds = mappings.Select(m => m.ActivityId).Distinct().ToList();

        // Validar elementos
        var validElements = await _context.Elements
            .Include(e => e.ModelVersion)
            .ThenInclude(m => m.Project)
            .Where(e => elementIds.Contains(e.Id) && e.ModelVersion.Project.TenantId == tenantId)
            .Select(e => e.Id)
            .ToListAsync();

        // Validar atividades
        var validActivities = await _context.Activities
            .Include(a => a.Project)
            .Where(a => activityIds.Contains(a.Id) && a.Project.TenantId == tenantId)
            .Select(a => a.Id)
            .ToListAsync();

        var newMappings = mappings
            .Where(dto => validElements.Contains(dto.ElementId) && validActivities.Contains(dto.ActivityId))
            .Select(dto => new ElementActivityMapping
            {
                Id = Guid.NewGuid(),
                ElementId = dto.ElementId,
                ActivityId = dto.ActivityId,
                MappingType = dto.MappingType,
                Confidence = dto.Confidence,
                CreatedAt = DateTime.UtcNow
            })
            .ToList();

        _context.ElementActivityMappings.AddRange(newMappings);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created {Count} mappings", newMappings.Count);

        return CreatedAtAction(nameof(GetMappings), 
            null, 
            new { count = newMappings.Count });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMapping(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var mapping = await _context.ElementActivityMappings
            .Include(m => m.Activity)
            .ThenInclude(a => a.Project)
            .FirstOrDefaultAsync(m => m.Id == id && m.Activity.Project.TenantId == tenantId);

        if (mapping == null)
        {
            return NotFound();
        }

        _context.ElementActivityMappings.Remove(mapping);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("auto-map")]
    public async Task<ActionResult> AutoMapByRules([FromBody] AutoMapRequestDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();

        // Buscar elementos do modelo
        var elements = await _context.Elements
            .Include(e => e.ModelVersion)
            .ThenInclude(m => m.Project)
            .Where(e => e.ModelVersionId == dto.ModelVersionId && e.ModelVersion.Project.TenantId == tenantId)
            .ToListAsync();

        // Buscar atividades do projeto
        var activities = await _context.Activities
            .Include(a => a.Project)
            .Where(a => a.ProjectId == dto.ProjectId && a.Project.TenantId == tenantId)
            .ToListAsync();

        var newMappings = new List<ElementActivityMapping>();

        // Regra simples: mapear por disciplina e tipo
        foreach (var element in elements)
        {
            var matchingActivity = activities.FirstOrDefault(a =>
                a.Name.Contains(element.Discipline, StringComparison.OrdinalIgnoreCase) ||
                a.Name.Contains(element.Type, StringComparison.OrdinalIgnoreCase) ||
                (element.Level != null && a.Name.Contains(element.Level, StringComparison.OrdinalIgnoreCase))
            );

            if (matchingActivity != null)
            {
                newMappings.Add(new ElementActivityMapping
                {
                    Id = Guid.NewGuid(),
                    ElementId = element.Id,
                    ActivityId = matchingActivity.Id,
                    MappingType = MappingType.AutoGenerated,
                    Confidence = 0.7m,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        _context.ElementActivityMappings.AddRange(newMappings);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Auto-mapped {Count} elements to activities", newMappings.Count);

        return Ok(new { 
            message = "Mapeamento automático concluído", 
            count = newMappings.Count,
            totalElements = elements.Count,
            coverage = elements.Count > 0 ? (decimal)newMappings.Count / elements.Count * 100 : 0
        });
    }
}

public record CreateMappingDto(
    Guid ElementId,
    Guid ActivityId,
    Shancrys.Api.Models.MappingType MappingType,
    decimal Confidence
);

public record AutoMapRequestDto(
    Guid ProjectId,
    Guid ModelVersionId
);
