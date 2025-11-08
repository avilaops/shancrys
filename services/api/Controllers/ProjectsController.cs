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
            return NotFound(new { message = "Project not found" });

        return Ok(project);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Project>> UpdateProject(Guid id, [FromBody] ProjectUpdateDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized(new { message = "Tenant not identified" });

        var filter = Builders<Project>.Filter.Eq(p => p.Id, id) & 
                     Builders<Project>.Filter.Eq(p => p.TenantId, tenantId.Value);

        var project = await _context.Projects.Find(filter).FirstOrDefaultAsync();
        if (project == null)
            return NotFound(new { message = "Project not found" });

        // Atualizar campos
        var updateBuilder = Builders<Project>.Update;
        var updates = new List<UpdateDefinition<Project>>
        {
            updateBuilder.Set(p => p.UpdatedAt, DateTime.UtcNow)
        };

        if (!string.IsNullOrWhiteSpace(dto.Name))
            updates.Add(updateBuilder.Set(p => p.Name, dto.Name));

        if (!string.IsNullOrWhiteSpace(dto.Location))
            updates.Add(updateBuilder.Set(p => p.Location, dto.Location));

        if (dto.Description != null)
            updates.Add(updateBuilder.Set(p => p.Description, dto.Description));

        if (dto.Status.HasValue)
            updates.Add(updateBuilder.Set(p => p.Status, dto.Status.Value));

        if (dto.StartDate.HasValue)
            updates.Add(updateBuilder.Set(p => p.StartDate, dto.StartDate.Value));

        if (dto.EndDate.HasValue)
            updates.Add(updateBuilder.Set(p => p.EndDate, dto.EndDate.Value));

        var update = updateBuilder.Combine(updates);
        await _context.Projects.UpdateOneAsync(filter, update);

        // Buscar projeto atualizado
        var updatedProject = await _context.Projects.Find(filter).FirstOrDefaultAsync();

        _logger.LogInformation("Project {ProjectId} updated", id);

        return Ok(updatedProject);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProject(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized(new { message = "Tenant not identified" });

        var filter = Builders<Project>.Filter.Eq(p => p.Id, id) & 
                     Builders<Project>.Filter.Eq(p => p.TenantId, tenantId.Value);

        var result = await _context.Projects.DeleteOneAsync(filter);

        if (result.DeletedCount == 0)
            return NotFound(new { message = "Project not found" });

        _logger.LogInformation("Project {ProjectId} deleted", id);

        return NoContent();
    }

    [HttpPost("{id}/members")]
    public async Task<ActionResult> AddMember(Guid id, [FromBody] ProjectMemberDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized(new { message = "Tenant not identified" });

        var filter = Builders<Project>.Filter.Eq(p => p.Id, id) & 
                     Builders<Project>.Filter.Eq(p => p.TenantId, tenantId.Value);

        var project = await _context.Projects.Find(filter).FirstOrDefaultAsync();
        if (project == null)
            return NotFound(new { message = "Project not found" });

        // Verificar se usuário existe
        var user = await _context.Users.Find(u => u.Id == dto.UserId).FirstOrDefaultAsync();
        if (user == null)
            return BadRequest(new { message = "User not found" });

        // Verificar se já é membro
        if (project.Members.Any(m => m.UserId == dto.UserId))
            return BadRequest(new { message = "User is already a member" });

        var member = new ProjectMember
        {
            UserId = dto.UserId,
            Role = dto.Role,
            AddedAt = DateTime.UtcNow
        };

        var update = Builders<Project>.Update
            .Push(p => p.Members, member)
            .Set(p => p.UpdatedAt, DateTime.UtcNow);

        await _context.Projects.UpdateOneAsync(filter, update);

        _logger.LogInformation("User {UserId} added to project {ProjectId} with role {Role}", 
            dto.UserId, id, dto.Role);

        return Ok(new { message = "Member added successfully", member });
    }

    [HttpDelete("{id}/members/{userId}")]
    public async Task<ActionResult> RemoveMember(Guid id, Guid userId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized(new { message = "Tenant not identified" });

        var filter = Builders<Project>.Filter.Eq(p => p.Id, id) & 
                     Builders<Project>.Filter.Eq(p => p.TenantId, tenantId.Value);

        var update = Builders<Project>.Update
            .PullFilter(p => p.Members, m => m.UserId == userId)
            .Set(p => p.UpdatedAt, DateTime.UtcNow);

        var result = await _context.Projects.UpdateOneAsync(filter, update);

        if (result.MatchedCount == 0)
            return NotFound(new { message = "Project not found" });

        _logger.LogInformation("User {UserId} removed from project {ProjectId}", userId, id);

        return Ok(new { message = "Member removed successfully" });
    }

    [HttpGet("{id}/models")]
    public async Task<ActionResult<object>> GetProjectModels(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized(new { message = "Tenant not identified" });

        var projectFilter = Builders<Project>.Filter.Eq(p => p.Id, id) & 
                           Builders<Project>.Filter.Eq(p => p.TenantId, tenantId.Value);

        var project = await _context.Projects.Find(projectFilter).FirstOrDefaultAsync();
        if (project == null)
            return NotFound(new { message = "Project not found" });

        var models = await _context.ModelVersions
            .Find(m => m.ProjectId == id)
            .SortByDescending(m => m.UploadedAt)
            .ToListAsync();

        return Ok(new
        {
            projectId = id,
            projectName = project.Name,
            models,
            total = models.Count
        });
    }

    [HttpGet("{id}/stats")]
    public async Task<ActionResult<object>> GetProjectStats(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null)
            return Unauthorized(new { message = "Tenant not identified" });

        var projectFilter = Builders<Project>.Filter.Eq(p => p.Id, id) & 
                           Builders<Project>.Filter.Eq(p => p.TenantId, tenantId.Value);

        var project = await _context.Projects.Find(projectFilter).FirstOrDefaultAsync();
        if (project == null)
            return NotFound(new { message = "Project not found" });

        var modelsCount = await _context.ModelVersions
            .CountDocumentsAsync(m => m.ProjectId == id);

        var activitiesCount = await _context.Activities
            .CountDocumentsAsync(a => a.ProjectId == id);

        var elementsCount = await _context.Elements
            .CountDocumentsAsync(e => e.ProjectId == id);

        return Ok(new
        {
            projectId = id,
            projectName = project.Name,
            stats = new
            {
                models = modelsCount,
                activities = activitiesCount,
                elements = elementsCount,
                members = project.Members.Count,
                status = project.Status.ToString()
            },
            dates = new
            {
                created = project.CreatedAt,
                updated = project.UpdatedAt,
                start = project.StartDate,
                end = project.EndDate
            }
        });
    }
}

// DTOs
public record ProjectCreateDto(string Name, string Location, string? Description);

public record ProjectUpdateDto(
    string? Name,
    string? Location,
    string? Description,
    ProjectStatus? Status,
    DateTime? StartDate,
    DateTime? EndDate
);

public record ProjectMemberDto(Guid UserId, ProjectRole Role);
