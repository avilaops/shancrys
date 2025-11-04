using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shancrys.Api.Data;
using Shancrys.Api.Middleware;
using Shancrys.Api.Models;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/models")]
[Authorize]
public class ModelsController : ControllerBase
{
    private readonly ShancrysDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ModelsController> _logger;

    public ModelsController(
        ShancrysDbContext context,
        ITenantService tenantService,
        ILogger<ModelsController> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ModelVersion>>> GetModels(
        [FromQuery] Guid? projectId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var query = _context.ModelVersions
            .Include(m => m.Project)
            .Where(m => m.Project.TenantId == tenantId);

        if (projectId.HasValue)
        {
            query = query.Where(m => m.ProjectId == projectId.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.UploadedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedResult<ModelVersion>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ModelVersion>> GetModel(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var model = await _context.ModelVersions
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => m.Id == id && m.Project.TenantId == tenantId);

        if (model == null)
        {
            return NotFound();
        }

        return Ok(model);
    }

    [HttpPost]
    [RequestSizeLimit(500_000_000)] // 500MB max
    public async Task<ActionResult<ModelVersion>> UploadModel(
        [FromForm] Guid projectId,
        [FromForm] IFormFile file,
        [FromForm] string? description)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        // Validar projeto
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.TenantId == tenantId);
        
        if (project == null)
        {
            return NotFound("Projeto não encontrado");
        }

        // Validar arquivo
        if (file == null || file.Length == 0)
        {
            return BadRequest("Arquivo não fornecido");
        }

        var allowedExtensions = new[] { ".ifc", ".ifcxml", ".rvt", ".dgn" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest($"Formato não suportado. Use: {string.Join(", ", allowedExtensions)}");
        }

        // Salvar arquivo temporariamente
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", tenantId.ToString());
        Directory.CreateDirectory(uploadsPath);
        
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Calcular hash do arquivo
        string fileHash;
        using (var md5 = System.Security.Cryptography.MD5.Create())
        using (var stream = System.IO.File.OpenRead(filePath))
        {
            var hash = await md5.ComputeHashAsync(stream);
            fileHash = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
        }

        // Criar versão do modelo
        var model = new ModelVersion
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            FileName = file.FileName,
            FilePath = filePath,
            FileSize = file.Length,
            FileHash = fileHash,
            Format = extension.TrimStart('.').ToUpperInvariant(),
            Description = description,
            Version = await GetNextVersionNumber(projectId),
            UploadedAt = DateTime.UtcNow,
            Status = ModelStatus.Uploaded,
            Stats = new Dictionary<string, object>
            {
                { "uploadedBy", User.Identity?.Name ?? "unknown" }
            }
        };

        _context.ModelVersions.Add(model);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Model {ModelId} uploaded for project {ProjectId}", model.Id, projectId);

        // TODO: Enfileirar job para processar o modelo via engine C++
        // await _messageQueue.PublishAsync("modelo.uploaded", new { modelId = model.Id });

        return CreatedAtAction(nameof(GetModel), new { id = model.Id }, model);
    }

    [HttpPost("{id}/process")]
    public async Task<ActionResult> ProcessModel(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var model = await _context.ModelVersions
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => m.Id == id && m.Project.TenantId == tenantId);

        if (model == null)
        {
            return NotFound();
        }

        if (model.Status == ModelStatus.Processing)
        {
            return BadRequest("Modelo já está sendo processado");
        }

        model.Status = ModelStatus.Processing;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Starting processing for model {ModelId}", id);

        // TODO: Chamar engine C++ para processar
        // Simulação: extrair elementos mock
        _ = Task.Run(async () => await SimulateModelProcessing(id));

        return Accepted(new { message = "Processamento iniciado", modelId = id });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteModel(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var model = await _context.ModelVersions
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => m.Id == id && m.Project.TenantId == tenantId);

        if (model == null)
        {
            return NotFound();
        }

        // Deletar arquivo físico
        if (System.IO.File.Exists(model.FilePath))
        {
            System.IO.File.Delete(model.FilePath);
        }

        _context.ModelVersions.Remove(model);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<int> GetNextVersionNumber(Guid projectId)
    {
        var maxVersion = await _context.ModelVersions
            .Where(m => m.ProjectId == projectId)
            .MaxAsync(m => (int?)m.Version) ?? 0;
        
        return maxVersion + 1;
    }

    private async Task SimulateModelProcessing(Guid modelId)
    {
        await Task.Delay(2000); // Simula processamento

        using var scope = HttpContext.RequestServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ShancrysDbContext>();
        
        var model = await context.ModelVersions.FindAsync(modelId);
        if (model != null)
        {
            model.Status = ModelStatus.Ready;
            model.Stats = new Dictionary<string, object>
            {
                { "totalElements", 150 },
                { "architectural", 80 },
                { "structural", 50 },
                { "mep", 20 },
                { "processedAt", DateTime.UtcNow }
            };
            await context.SaveChangesAsync();
        }
    }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(Total / (double)PageSize);
}
