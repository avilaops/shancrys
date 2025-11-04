using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Shancrys.Api.Data;
using Shancrys.Api.Middleware;
using Shancrys.Api.Models;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(
        IMongoDbContext context,
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

        var filterBuilder = Builders<Project>.Filter;
        var filter = filterBuilder.Eq(p => p.TenantId, tenantId.Value);

        if (status.HasValue)
        {
            filter = filter & filterBuilder.Eq(p => p.Status, status.Value);
        }

        var total = await _context.Projects.CountDocumentsAsync(filter);
        var items = await _context.Projects
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
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

        await _context.Projects.InsertOneAsync(project);

        _logger.LogInformation("Project {ProjectId} created by tenant {TenantId}", project.Id, tenantId);

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetProject(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized();

        var filter = Builders<Project>.Filter.Eq(p => p.Id, id) & 
                     Builders<Project>.Filter.Eq(p => p.TenantId, tenantId.Value);

        var project = await _context.Projects.Find(filter).FirstOrDefaultAsync();

        if (project == null)
            return NotFound();

        return Ok(project);
    }
}

public record ProjectCreateDto(string Name, string Location, string? Description);
