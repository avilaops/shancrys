using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shancrys.Api.Data;
using Shancrys.Api.Middleware;
using Shancrys.Api.Models;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/elements")]
[Authorize]
public class ElementsController : ControllerBase
{
    private readonly ShancrysDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ElementsController> _logger;

    public ElementsController(
        ShancrysDbContext context,
        ITenantService tenantService,
        ILogger<ElementsController> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Element>>> GetElements(
        [FromQuery] Guid? modelVersionId,
        [FromQuery] string? discipline,
        [FromQuery] string? type,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var query = _context.Elements
            .Include(e => e.ModelVersion)
            .ThenInclude(m => m.Project)
            .Where(e => e.ModelVersion.Project.TenantId == tenantId);

        if (modelVersionId.HasValue)
        {
            query = query.Where(e => e.ModelVersionId == modelVersionId.Value);
        }

        if (!string.IsNullOrWhiteSpace(discipline))
        {
            query = query.Where(e => e.Discipline == discipline);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(e => e.Type == type);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e => 
                e.Name.Contains(search) || 
                e.IfcGuid.Contains(search));
        }

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedResult<Element>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Element>> GetElement(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var element = await _context.Elements
            .Include(e => e.ModelVersion)
            .ThenInclude(m => m.Project)
            .FirstOrDefaultAsync(e => 
                e.Id == id && 
                e.ModelVersion.Project.TenantId == tenantId);

        if (element == null)
        {
            return NotFound();
        }

        return Ok(element);
    }

    [HttpGet("disciplines")]
    public async Task<ActionResult<List<string>>> GetDisciplines([FromQuery] Guid? modelVersionId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var query = _context.Elements
            .Include(e => e.ModelVersion)
            .ThenInclude(m => m.Project)
            .Where(e => e.ModelVersion.Project.TenantId == tenantId);

        if (modelVersionId.HasValue)
        {
            query = query.Where(e => e.ModelVersionId == modelVersionId.Value);
        }

        var disciplines = await query
            .Select(e => e.Discipline)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync();

        return Ok(disciplines);
    }

    [HttpGet("types")]
    public async Task<ActionResult<List<string>>> GetTypes(
        [FromQuery] Guid? modelVersionId,
        [FromQuery] string? discipline)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var query = _context.Elements
            .Include(e => e.ModelVersion)
            .ThenInclude(m => m.Project)
            .Where(e => e.ModelVersion.Project.TenantId == tenantId);

        if (modelVersionId.HasValue)
        {
            query = query.Where(e => e.ModelVersionId == modelVersionId.Value);
        }

        if (!string.IsNullOrWhiteSpace(discipline))
        {
            query = query.Where(e => e.Discipline == discipline);
        }

        var types = await query
            .Select(e => e.Type)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync();

        return Ok(types);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult> CreateElementsBulk([FromBody] List<CreateElementDto> elements)
    {
        var tenantId = _tenantService.GetCurrentTenantId();

        if (elements == null || elements.Count == 0)
        {
            return BadRequest("Nenhum elemento fornecido");
        }

        var modelVersionId = elements.First().ModelVersionId;
        
        // Validar modelo
        var model = await _context.ModelVersions
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => 
                m.Id == modelVersionId && 
                m.Project.TenantId == tenantId);

        if (model == null)
        {
            return NotFound("Modelo não encontrado");
        }

        var newElements = elements.Select(dto => new Element
        {
            Id = Guid.NewGuid(),
            ModelVersionId = dto.ModelVersionId,
            VersionId = dto.ModelVersionId, // Mesmo valor
            IfcGuid = dto.IfcGuid,
            Guid = dto.IfcGuid, // Mesmo valor
            Name = dto.Name,
            Type = dto.Type,
            Discipline = dto.Discipline,
            Level = dto.Level,
            BoundingBox = dto.BoundingBox,
            Properties = dto.Properties ?? new Dictionary<string, object>()
        }).ToList();

        _context.Elements.AddRange(newElements);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created {Count} elements for model {ModelId}", 
            newElements.Count, modelVersionId);

        return CreatedAtAction(nameof(GetElements), 
            new { modelVersionId }, 
            new { count = newElements.Count, ids = newElements.Select(e => e.Id) });
    }
}

public record CreateElementDto(
    Guid ModelVersionId,
    string IfcGuid,
    string Name,
    string Type,
    string Discipline,
    string? Level,
    double[]? BoundingBox,
    Dictionary<string, object>? Properties
);
