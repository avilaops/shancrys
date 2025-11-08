using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Shancrys.Api.Data;
using Shancrys.Api.Models;
using Shancrys.Api.Models.DTOs;
using Shancrys.Api.Services;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/projects/{projectId}/models/{modelId}/[controller]")]
[Authorize]
public class ElementsController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly IIFCParserService _parserService;
    private readonly ILogger<ElementsController> _logger;

    public ElementsController(
        IMongoDbContext context,
        IIFCParserService parserService,
        ILogger<ElementsController> logger)
    {
        _context = context;
        _parserService = parserService;
        _logger = logger;
    }

    private Guid GetTenantId()
    {
        var tenantId = HttpContext.Items["TenantId"]?.ToString();
        return Guid.TryParse(tenantId, out var id) ? id : Guid.Empty;
    }

    private string GetUserId()
    {
        return User.FindFirst("userId")?.Value ?? "";
    }

    /// <summary>
    /// Lista elementos BIM de um modelo com filtros e paginação
    /// GET /api/projects/{projectId}/models/{modelId}/elements
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ElementsPagedResponse>> ListElements(
        Guid projectId,
        Guid modelId,
        [FromQuery] List<string>? ifcTypes = null,
        [FromQuery] string? buildingStorey = null,
        [FromQuery] int? level = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool? hasActivity = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var tenantId = GetTenantId();

            // Verificar acesso ao projeto
            var project = await _context.Projects
                .Find(p => p.Id == projectId && p.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (project == null)
                return NotFound(new { message = "Projeto não encontrado" });

            // Verificar acesso ao modelo
            var model = await _context.ModelVersions
                .Find(m => m.Id == modelId && m.ProjectId == projectId)
                .FirstOrDefaultAsync();

            if (model == null)
                return NotFound(new { message = "Modelo não encontrado" });

            // Construir filtro
            var filter = Builders<BIMElement>.Filter.And(
                Builders<BIMElement>.Filter.Eq(e => e.ModelId, modelId),
                Builders<BIMElement>.Filter.Eq(e => e.TenantId, tenantId)
            );

            if (ifcTypes != null && ifcTypes.Any())
            {
                filter &= Builders<BIMElement>.Filter.In(e => e.IfcType, ifcTypes);
            }

            if (!string.IsNullOrEmpty(buildingStorey))
            {
                filter &= Builders<BIMElement>.Filter.Eq(e => e.BuildingStorey, buildingStorey);
            }

            if (level.HasValue)
            {
                filter &= Builders<BIMElement>.Filter.Eq(e => e.Level, level.Value);
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var searchFilter = Builders<BIMElement>.Filter.Or(
                    Builders<BIMElement>.Filter.Regex(e => e.Name, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                    Builders<BIMElement>.Filter.Regex(e => e.Description, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                    Builders<BIMElement>.Filter.Regex(e => e.IfcType, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
                );
                filter &= searchFilter;
            }

            if (hasActivity.HasValue)
            {
                if (hasActivity.Value)
                    filter &= Builders<BIMElement>.Filter.Ne(e => e.LinkedActivityId, null);
                else
                    filter &= Builders<BIMElement>.Filter.Eq(e => e.LinkedActivityId, null);
            }

            // Contar total
            var total = await _context.BIMElements.CountDocumentsAsync(filter);

            // Buscar elementos paginados
            var elements = await _context.BIMElements
                .Find(filter)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            // Mapear para DTOs
            var elementDtos = elements.Select(e => new BIMElementSummaryDto
            {
                Id = e.Id,
                IfcId = e.IfcId,
                IfcType = e.IfcType,
                Name = e.Name,
                BuildingStorey = e.BuildingStorey,
                Level = e.Level,
                Volume = e.Volume,
                Area = e.Area,
                Length = e.Length,
                LinkedActivityId = e.LinkedActivityId,
                HasActivity = e.LinkedActivityId.HasValue
            }).ToList();

            var response = new ElementsPagedResponse
            {
                Elements = elementDtos,
                Total = (int)total,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(total / (double)pageSize)
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar elementos do modelo {ModelId}", modelId);
            return StatusCode(500, new { message = "Erro ao listar elementos" });
        }
    }

    /// <summary>
    /// Busca um elemento específico por ID
    /// GET /api/projects/{projectId}/models/{modelId}/elements/{elementId}
    /// </summary>
    [HttpGet("{elementId}")]
    public async Task<ActionResult<BIMElementDto>> GetElement(
        Guid projectId,
        Guid modelId,
        Guid elementId)
    {
        try
        {
            var tenantId = GetTenantId();

            var element = await _context.BIMElements
                .Find(e => e.Id == elementId && e.ModelId == modelId && e.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (element == null)
                return NotFound(new { message = "Elemento não encontrado" });

            var dto = new BIMElementDto
            {
                Id = element.Id,
                ModelId = element.ModelId,
                ProjectId = element.ProjectId,
                IfcId = element.IfcId,
                EntityLabel = element.EntityLabel,
                IfcType = element.IfcType,
                GlobalId = element.GlobalId,
                Name = element.Name,
                Description = element.Description,
                ParentId = element.ParentId,
                ChildrenIds = element.ChildrenIds,
                BuildingStorey = element.BuildingStorey,
                Level = element.Level,
                Properties = element.Properties,
                Materials = element.Materials,
                BoundingBox = element.BoundingBox != null ? new BoundingBoxDto
                {
                    Min = new Point3DDto
                    {
                        X = element.BoundingBox.Min.X,
                        Y = element.BoundingBox.Min.Y,
                        Z = element.BoundingBox.Min.Z
                    },
                    Max = new Point3DDto
                    {
                        X = element.BoundingBox.Max.X,
                        Y = element.BoundingBox.Max.Y,
                        Z = element.BoundingBox.Max.Z
                    }
                } : null,
                Volume = element.Volume,
                Area = element.Area,
                Length = element.Length,
                LinkedActivityId = element.LinkedActivityId,
                ExtractedAt = element.ExtractedAt
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar elemento {ElementId}", elementId);
            return StatusCode(500, new { message = "Erro ao buscar elemento" });
        }
    }

    /// <summary>
    /// Retorna agregação de elementos por tipo
    /// GET /api/projects/{projectId}/models/{modelId}/elements/types
    /// </summary>
    [HttpGet("types")]
    public async Task<ActionResult<List<ElementTypeSummary>>> GetElementTypes(
        Guid projectId,
        Guid modelId)
    {
        try
        {
            var summary = await _parserService.GetElementTypeSummaryAsync(modelId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar tipos de elementos do modelo {ModelId}", modelId);
            return StatusCode(500, new { message = "Erro ao buscar tipos" });
        }
    }

    /// <summary>
    /// Vincula elementos a uma atividade (4D)
    /// POST /api/projects/{projectId}/models/{modelId}/elements/link
    /// </summary>
    [HttpPost("link")]
    public async Task<ActionResult<LinkElementsResponse>> LinkElementsToActivity(
        Guid projectId,
        Guid modelId,
        [FromBody] LinkElementsToActivityRequest request)
    {
        try
        {
            var tenantId = GetTenantId();

            // Verificar atividade
            var activity = await _context.Activities
                .Find(a => a.Id == request.ActivityId && a.ProjectId == projectId)
                .FirstOrDefaultAsync();

            if (activity == null)
                return NotFound(new { message = "Atividade não encontrada" });

            // Verificar elementos
            var filter = Builders<BIMElement>.Filter.And(
                Builders<BIMElement>.Filter.In(e => e.Id, request.ElementIds),
                Builders<BIMElement>.Filter.Eq(e => e.ModelId, modelId),
                Builders<BIMElement>.Filter.Eq(e => e.TenantId, tenantId)
            );

            var elements = await _context.BIMElements
                .Find(filter)
                .ToListAsync();

            if (elements.Count != request.ElementIds.Count)
            {
                return BadRequest(new { message = "Alguns elementos não foram encontrados" });
            }

            // Atualizar LinkedActivityId
            var update = Builders<BIMElement>.Update
                .Set(e => e.LinkedActivityId, request.ActivityId);

            var result = await _context.BIMElements.UpdateManyAsync(filter, update);

            var response = new LinkElementsResponse
            {
                ActivityId = request.ActivityId,
                LinkedCount = (int)result.ModifiedCount,
                ElementIds = request.ElementIds
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao vincular elementos à atividade {ActivityId}", request.ActivityId);
            return StatusCode(500, new { message = "Erro ao vincular elementos" });
        }
    }

    /// <summary>
    /// Remove vínculo de elementos com atividade
    /// DELETE /api/projects/{projectId}/models/{modelId}/elements/unlink
    /// </summary>
    [HttpDelete("unlink")]
    public async Task<ActionResult> UnlinkElementsFromActivity(
        Guid projectId,
        Guid modelId,
        [FromBody] List<Guid> elementIds)
    {
        try
        {
            var tenantId = GetTenantId();

            var filter = Builders<BIMElement>.Filter.And(
                Builders<BIMElement>.Filter.In(e => e.Id, elementIds),
                Builders<BIMElement>.Filter.Eq(e => e.ModelId, modelId),
                Builders<BIMElement>.Filter.Eq(e => e.TenantId, tenantId)
            );

            var update = Builders<BIMElement>.Update
                .Set(e => e.LinkedActivityId, null);

            var result = await _context.BIMElements.UpdateManyAsync(filter, update);

            return Ok(new { unlinkedCount = result.ModifiedCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao desvincular elementos");
            return StatusCode(500, new { message = "Erro ao desvincular elementos" });
        }
    }

    /// <summary>
    /// Busca avançada de elementos com múltiplos filtros
    /// POST /api/projects/{projectId}/models/{modelId}/elements/search
    /// </summary>
    [HttpPost("search")]
    public async Task<ActionResult<ElementsPagedResponse>> SearchElements(
        Guid projectId,
        Guid modelId,
        [FromBody] ElementFilterRequest request)
    {
        return await ListElements(
            projectId,
            modelId,
            request.IfcTypes,
            request.BuildingStorey,
            request.Level,
            request.SearchTerm,
            request.HasActivity,
            request.Page,
            request.PageSize
        );
    }
}
