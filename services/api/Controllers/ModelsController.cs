using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Shancrys.Api.Data;
using Shancrys.Api.Models;
using Shancrys.Api.Services;
using Shancrys.Api.Middleware;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ModelsController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly IBlobStorageService _blobStorage;
    private readonly ILogger<ModelsController> _logger;
    private readonly ITenantService _tenantService;
    private readonly IIFCParserService _ifcParser;

    public ModelsController(
        IMongoDbContext context,
        IBlobStorageService blobStorage,
        ILogger<ModelsController> logger,
        ITenantService tenantService,
        IIFCParserService ifcParser)
    {
        _context = context;
        _blobStorage = blobStorage;
        _logger = logger;
        _tenantService = tenantService;
        _ifcParser = ifcParser;
    }

    private Guid GetTenantIdOrThrow()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
        {
            throw new UnauthorizedAccessException("TenantId não encontrado");
        }
        return tenantId.Value;
    }

    /// <summary>
    /// Upload de arquivo IFC/RVT/DGN para um projeto
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(500_000_000)] // 500MB max
    public async Task<IActionResult> UploadModel(
        [FromForm] IFormFile file,
        [FromForm] Guid projectId,
        [FromForm] string? description,
        [FromForm] int version = 1)
    {
        var tenantId = GetTenantIdOrThrow();
        
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Arquivo não fornecido ou vazio" });
        }

        // Validar extensão
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".ifc", ".rvt", ".dgn" };
        
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = $"Formato não suportado. Use: {string.Join(", ", allowedExtensions)}" });
        }

        // Verificar se o projeto existe e pertence ao tenant
        var project = await _context.Projects
            .Find(p => p.Id == projectId && p.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound(new { message = "Projeto não encontrado" });
        }

        try
        {
            // Calcular hash do arquivo
            string fileHash;
            using (var stream = file.OpenReadStream())
            {
                using var md5 = System.Security.Cryptography.MD5.Create();
                var hashBytes = await md5.ComputeHashAsync(stream);
                fileHash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
            }

            // Verificar se o arquivo já foi enviado
            var existingModel = await _context.ModelVersions
                .Find(m => m.ProjectId == projectId && m.FileHash == fileHash)
                .FirstOrDefaultAsync();

            if (existingModel != null)
            {
                return Conflict(new { message = "Este arquivo já foi enviado anteriormente", modelId = existingModel.Id });
            }

            // Upload para Azure Blob Storage
            var blobName = $"{tenantId}/{projectId}/{Guid.NewGuid()}{extension}";
            string blobUrl;

            using (var fileStream = file.OpenReadStream())
            {
                blobUrl = await _blobStorage.UploadFileAsync(fileStream, blobName, file.ContentType);
            }

            // Criar registro do modelo
            var model = new ModelVersion
            {
                ProjectId = projectId,
                FileName = file.FileName,
                FilePath = blobUrl,
                FileSize = file.Length,
                FileHash = fileHash,
                Format = extension.TrimStart('.').ToUpperInvariant(),
                FileType = extension switch
                {
                    ".ifc" => FileType.IFC,
                    ".rvt" => FileType.RVT,
                    ".dgn" => FileType.DGN,
                    _ => FileType.IFC
                },
                Description = description,
                Version = version,
                Status = ModelStatus.Processing,
                CreatedBy = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString())
            };

            await _context.ModelVersions.InsertOneAsync(model);

            _logger.LogInformation("Modelo {FileName} enviado para o projeto {ProjectId}", file.FileName, projectId);

            // Iniciar parsing do IFC em background (somente para arquivos .ifc)
            if (extension == ".ifc")
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        // Salvar arquivo temporariamente para parsing
                        var tempFilePath = System.IO.Path.Combine(System.IO.Path.GetTempPath(), $"{model.Id}.ifc");
                        
                        // Baixar arquivo do blob via URL
                        var downloadUrl = await _blobStorage.GetDownloadUrlAsync(blobUrl, TimeSpan.FromHours(1));
                        using (var httpClient = new HttpClient())
                        using (var response = await httpClient.GetAsync(downloadUrl))
                        using (var fileStream = System.IO.File.Create(tempFilePath))
                        {
                            await response.Content.CopyToAsync(fileStream);
                        }

                        // Parse do arquivo IFC
                        _logger.LogInformation("Iniciando parsing do arquivo IFC {ModelId}", model.Id);
                        var parseResult = await _ifcParser.ParseIfcFileAsync(tempFilePath, model.Id, projectId, tenantId);
                        
                        if (parseResult.Success)
                        {
                            _logger.LogInformation("Parsing concluído: {Count} elementos extraídos do modelo {ModelId}",
                                parseResult.ElementsCount, model.Id);
                        }
                        else
                        {
                            _logger.LogError("Erro no parsing do modelo {ModelId}: {Error}",
                                model.Id, parseResult.ErrorMessage);
                        }

                        // Limpar arquivo temporário
                        if (System.IO.File.Exists(tempFilePath))
                            System.IO.File.Delete(tempFilePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar arquivo IFC {ModelId}", model.Id);
                    }
                });
            }

            return CreatedAtAction(
                nameof(GetModelById),
                new { id = model.Id },
                new
                {
                    id = model.Id,
                    fileName = model.FileName,
                    fileSize = model.FileSize,
                    version = model.Version,
                    status = model.Status.ToString(),
                    uploadedAt = model.UploadedAt,
                    message = "Upload realizado com sucesso. O arquivo está sendo processado."
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer upload do modelo para o projeto {ProjectId}", projectId);
            return StatusCode(500, new { message = "Erro ao fazer upload do arquivo", error = ex.Message });
        }
    }

    /// <summary>
    /// Listar todos os modelos de um projeto
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetProjectModels(Guid projectId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        if (!tenantId.HasValue)
        {
            return Unauthorized(new { message = "TenantId não encontrado" });
        }

        // Verificar acesso ao projeto
        var project = await _context.Projects
            .Find(p => p.Id == projectId && p.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound(new { message = "Projeto não encontrado" });
        }

        var filter = Builders<ModelVersion>.Filter.Eq(m => m.ProjectId, projectId);
        
        var totalCount = await _context.ModelVersions.CountDocumentsAsync(filter);
        
        var models = await _context.ModelVersions
            .Find(filter)
            .SortByDescending(m => m.UploadedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return Ok(new
        {
            items = models.Select(m => new
            {
                id = m.Id,
                fileName = m.FileName,
                fileSize = m.FileSize,
                format = m.Format,
                fileType = m.FileType.ToString(),
                description = m.Description,
                version = m.Version,
                status = m.Status.ToString(),
                uploadedAt = m.UploadedAt,
                createdBy = m.CreatedBy,
                stats = m.Stats
            }),
            page,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    /// <summary>
    /// Obter detalhes de um modelo específico
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetModelById(Guid id)
    {
        var tenantId = GetTenantIdOrThrow();

        var model = await _context.ModelVersions
            .Find(m => m.Id == id)
            .FirstOrDefaultAsync();

        if (model == null)
        {
            return NotFound(new { message = "Modelo não encontrado" });
        }

        // Verificar se o projeto pertence ao tenant
        var project = await _context.Projects
            .Find(p => p.Id == model.ProjectId && p.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound(new { message = "Acesso negado" });
        }

        return Ok(new
        {
            id = model.Id,
            projectId = model.ProjectId,
            fileName = model.FileName,
            filePath = model.FilePath,
            fileSize = model.FileSize,
            fileHash = model.FileHash,
            format = model.Format,
            fileType = model.FileType.ToString(),
            description = model.Description,
            version = model.Version,
            status = model.Status.ToString(),
            stats = model.Stats,
            uploadedAt = model.UploadedAt,
            createdAt = model.CreatedAt,
            createdBy = model.CreatedBy
        });
    }

    /// <summary>
    /// Obter URL de download temporária para um modelo
    /// </summary>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> GetDownloadUrl(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();

        var model = await _context.ModelVersions
            .Find(m => m.Id == id)
            .FirstOrDefaultAsync();

        if (model == null)
        {
            return NotFound(new { message = "Modelo não encontrado" });
        }

        // Verificar acesso
        var project = await _context.Projects
            .Find(p => p.Id == model.ProjectId && p.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound(new { message = "Acesso negado" });
        }

        try
        {
            // Gerar URL SAS com 1 hora de validade
            var downloadUrl = await _blobStorage.GetDownloadUrlAsync(model.FilePath, TimeSpan.FromHours(1));

            return Ok(new
            {
                downloadUrl,
                fileName = model.FileName,
                fileSize = model.FileSize,
                expiresIn = "1 hour"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar URL de download para modelo {ModelId}", id);
            return StatusCode(500, new { message = "Erro ao gerar URL de download" });
        }
    }

    /// <summary>
    /// Deletar um modelo
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteModel(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();

        var model = await _context.ModelVersions
            .Find(m => m.Id == id)
            .FirstOrDefaultAsync();

        if (model == null)
        {
            return NotFound(new { message = "Modelo não encontrado" });
        }

        // Verificar acesso
        var project = await _context.Projects
            .Find(p => p.Id == model.ProjectId && p.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound(new { message = "Acesso negado" });
        }

        try
        {
            // Deletar do blob storage
            await _blobStorage.DeleteFileAsync(model.FilePath);

            // Deletar do banco
            await _context.ModelVersions.DeleteOneAsync(m => m.Id == id);

            // Deletar elementos associados
            await _context.Elements.DeleteManyAsync(e => e.ModelVersionId == id);

            _logger.LogInformation("Modelo {ModelId} deletado do projeto {ProjectId}", id, model.ProjectId);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar modelo {ModelId}", id);
            return StatusCode(500, new { message = "Erro ao deletar modelo" });
        }
    }

    /// <summary>
    /// Atualizar informações de um modelo
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateModel(Guid id, [FromBody] ModelUpdateDto updateDto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();

        var model = await _context.ModelVersions
            .Find(m => m.Id == id)
            .FirstOrDefaultAsync();

        if (model == null)
        {
            return NotFound(new { message = "Modelo não encontrado" });
        }

        // Verificar acesso
        var project = await _context.Projects
            .Find(p => p.Id == model.ProjectId && p.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound(new { message = "Acesso negado" });
        }

        var updateDefinition = Builders<ModelVersion>.Update;
        var updates = new List<UpdateDefinition<ModelVersion>>();

        if (!string.IsNullOrEmpty(updateDto.Description))
        {
            updates.Add(updateDefinition.Set(m => m.Description, updateDto.Description));
        }

        if (updateDto.Status.HasValue)
        {
            updates.Add(updateDefinition.Set(m => m.Status, updateDto.Status.Value));
        }

        if (updateDto.Stats != null)
        {
            updates.Add(updateDefinition.Set(m => m.Stats, updateDto.Stats));
        }

        if (updates.Count == 0)
        {
            return BadRequest(new { message = "Nenhuma atualização fornecida" });
        }

        await _context.ModelVersions.UpdateOneAsync(
            m => m.Id == id,
            updateDefinition.Combine(updates)
        );

        var updatedModel = await _context.ModelVersions
            .Find(m => m.Id == id)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            id = updatedModel.Id,
            description = updatedModel.Description,
            status = updatedModel.Status.ToString(),
            stats = updatedModel.Stats,
            message = "Modelo atualizado com sucesso"
        });
    }

    /// <summary>
    /// Obter elementos de um modelo
    /// </summary>
    [HttpGet("{id}/elements")]
    public async Task<IActionResult> GetModelElements(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? type = null,
        [FromQuery] string? discipline = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();

        var model = await _context.ModelVersions
            .Find(m => m.Id == id)
            .FirstOrDefaultAsync();

        if (model == null)
        {
            return NotFound(new { message = "Modelo não encontrado" });
        }

        // Verificar acesso
        var project = await _context.Projects
            .Find(p => p.Id == model.ProjectId && p.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound(new { message = "Acesso negado" });
        }

        var filterBuilder = Builders<Element>.Filter;
        var filter = filterBuilder.Eq(e => e.ModelVersionId, id);

        if (!string.IsNullOrEmpty(type))
        {
            filter &= filterBuilder.Eq(e => e.Type, type);
        }

        if (!string.IsNullOrEmpty(discipline))
        {
            filter &= filterBuilder.Eq(e => e.Discipline, discipline);
        }

        var totalCount = await _context.Elements.CountDocumentsAsync(filter);

        var elements = await _context.Elements
            .Find(filter)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return Ok(new
        {
            items = elements.Select(e => new
            {
                id = e.Id,
                ifcGuid = e.IfcGuid,
                name = e.Name,
                type = e.Type,
                discipline = e.Discipline,
                level = e.Level,
                boundingBox = e.BoundingBox,
                volumeEstimated = e.VolumeEstimated,
                costEstimated = e.CostEstimated,
                properties = e.Properties
            }),
            page,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }
}

public class ModelUpdateDto
{
    public string? Description { get; set; }
    public ModelStatus? Status { get; set; }
    public Dictionary<string, object>? Stats { get; set; }
}



