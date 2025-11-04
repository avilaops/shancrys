using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shancrys.Api.Data;
using Shancrys.Api.Middleware;
using Shancrys.Api.Models;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ShancrysDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(
        ShancrysDbContext context,
        ITenantService tenantService,
        ILogger<ProjectsController> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetProjects(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] ProjectStatus? status = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized(new { message = "Tenant not identified" });

        var query = _context.Projects.Where(p => p.TenantId == tenantId);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            items,
            total,
            page,
            pageSize
        });
    }

    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject([FromBody] ProjectCreateDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized(new { message = "Tenant not identified" });

        var project = new Project
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId.Value,
            Name = dto.Name,
            Location = dto.Location,
            Description = dto.Description,
            Status = ProjectStatus.Planning
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Project {ProjectId} created by tenant {TenantId}", project.Id, tenantId);

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetProject(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized();

        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (project == null)
            return NotFound();

        return Ok(project);
    }
}

public record ProjectCreateDto(string Name, string Location, string? Description);
