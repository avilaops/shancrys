using Xbim.Ifc;
using Xbim.Ifc4.Interfaces;
using Xbim.Common.Geometry;
using Shancrys.Api.Models;
using Shancrys.Api.Models.DTOs;
using Shancrys.Api.Data;
using MongoDB.Driver;

namespace Shancrys.Api.Services;

public interface IIFCParserService
{
    Task<ParseIFCResponse> ParseIfcFileAsync(string filePath, Guid modelId, Guid projectId, Guid tenantId);
    Task<List<BIMElement>> GetModelElementsAsync(Guid modelId);
    Task<BIMElement?> GetElementByIdAsync(Guid elementId);
    Task<List<BIMElement>> GetElementsByTypeAsync(Guid modelId, string ifcType);
    Task<List<ElementTypeSummary>> GetElementTypeSummaryAsync(Guid modelId);
}

public class IFCParserService : IIFCParserService
{
    private readonly IMongoDbContext _context;
    private readonly ILogger<IFCParserService> _logger;

    public IFCParserService(IMongoDbContext context, ILogger<IFCParserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ParseIFCResponse> ParseIfcFileAsync(string filePath, Guid modelId, Guid projectId, Guid tenantId)
    {
        var response = new ParseIFCResponse
        {
            ModelId = modelId,
            ParsedAt = DateTime.UtcNow
        };

        try
        {
            _logger.LogInformation("Iniciando parsing do arquivo IFC: {FilePath}", filePath);

            using (var model = IfcStore.Open(filePath))
            {
                var elements = new List<BIMElement>();
                var typesSummary = new Dictionary<string, ElementTypeSummary>();

                // Extrair produtos IFC (elementos de construção)
                var ifcProducts = model.Instances.OfType<IIfcProduct>();

                _logger.LogInformation("Encontrados {Count} produtos IFC no modelo", ifcProducts.Count());

                foreach (var product in ifcProducts)
                {
                    try
                    {
                        var element = ExtractBIMElement(product, modelId, projectId, tenantId);
                        if (element != null)
                        {
                            elements.Add(element);

                            // Atualizar summary por tipo
                            if (!typesSummary.ContainsKey(element.IfcType))
                            {
                                typesSummary[element.IfcType] = new ElementTypeSummary
                                {
                                    IfcType = element.IfcType,
                                    Count = 0,
                                    TotalVolume = 0,
                                    TotalArea = 0
                                };
                            }

                            var summary = typesSummary[element.IfcType];
                            summary.Count++;
                            summary.TotalVolume += element.Volume;
                            summary.TotalArea += element.Area;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Erro ao processar elemento IFC: {Type}", product.GetType().Name);
                    }
                }

                // Salvar elementos no banco
                if (elements.Any())
                {
                    await _context.BIMElements.InsertManyAsync(elements);
                    _logger.LogInformation("Salvos {Count} elementos no MongoDB", elements.Count);
                }

                // Atualizar modelo
                var update = Builders<ModelVersion>.Update
                    .Set(m => m.IsParsed, true)
                    .Set(m => m.ElementsCount, elements.Count)
                    .Set(m => m.ParsedAt, DateTime.UtcNow)
                    .Set(m => m.Status, ModelStatus.Ready);

                await _context.ModelVersions.UpdateOneAsync(
                    m => m.Id == modelId,
                    update
                );

                response.Success = true;
                response.ElementsCount = elements.Count;
                response.TypesSummary = typesSummary.Values.ToList();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer parsing do arquivo IFC: {FilePath}", filePath);
            response.Success = false;
            response.ErrorMessage = ex.Message;

            // Marcar modelo como falhado
            var update = Builders<ModelVersion>.Update
                .Set(m => m.Status, ModelStatus.Failed);

            await _context.ModelVersions.UpdateOneAsync(
                m => m.Id == modelId,
                update
            );
        }

        return response;
    }

    private BIMElement? ExtractBIMElement(IIfcProduct product, Guid modelId, Guid projectId, Guid tenantId)
    {
        try
        {
            var element = new BIMElement
            {
                ModelId = modelId,
                ProjectId = projectId,
                TenantId = tenantId,
                IfcId = product.GlobalId.ToString(),
                EntityLabel = product.EntityLabel,
                IfcType = product.GetType().Name.Replace("Ifc", "").Replace("Proxy", ""),
                Name = product.Name.ToString(),
                Description = product.Description.ToString(),
                GlobalId = product.GlobalId.ToString(),
                ExtractedAt = DateTime.UtcNow
            };

            // Extrair propriedades
            ExtractProperties(product, element);

            // Extrair geometria e quantidades
            ExtractGeometry(product, element);

            // Extrair hierarquia
            ExtractHierarchy(product, element);

            // Extrair localização (andar)
            ExtractLocation(product, element);

            return element;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao extrair elemento: {Type}", product.GetType().Name);
            return null;
        }
    }

    private void ExtractProperties(IIfcProduct product, BIMElement element)
    {
        try
        {
            // Propriedades básicas
            var properties = new Dictionary<string, object>();

            // PropertySets
            var psets = product.IsDefinedBy
                .Where(r => r.RelatingPropertyDefinition is IIfcPropertySet)
                .SelectMany(r => (r.RelatingPropertyDefinition as IIfcPropertySet)?.HasProperties ?? Enumerable.Empty<IIfcProperty>());

            foreach (var prop in psets)
            {
                if (prop is IIfcPropertySingleValue singleValue && singleValue.NominalValue != null)
                {
                    properties[prop.Name.ToString()] = singleValue.NominalValue.ToString() ?? "";
                }
            }

            // Materiais
            var materials = new Dictionary<string, string>();
            var materialSelect = product.IsDefinedBy
                .Where(r => r.RelatingPropertyDefinition is IIfcMaterial)
                .Select(r => r.RelatingPropertyDefinition as IIfcMaterial)
                .Where(m => m != null);

            foreach (var material in materialSelect)
            {
                if (material?.Name != null)
                {
                    materials[material.Name.ToString() ?? "Unknown"] = "Material";
                }
            }

            element.Properties = properties;
            element.Materials = materials;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao extrair propriedades do elemento {IfcId}", element.IfcId);
        }
    }

    private void ExtractGeometry(IIfcProduct product, BIMElement element)
    {
        try
        {
            // Tentar extrair volumes e áreas de quantidades
            var quantities = product.IsDefinedBy
                .Where(r => r.RelatingPropertyDefinition is IIfcElementQuantity)
                .SelectMany(r => (r.RelatingPropertyDefinition as IIfcElementQuantity)?.Quantities ?? Enumerable.Empty<IIfcPhysicalQuantity>());

            foreach (var quantity in quantities)
            {
                if (quantity is IIfcQuantityVolume volumeQty)
                {
                    element.Volume = (double)volumeQty.VolumeValue;
                }
                else if (quantity is IIfcQuantityArea areaQty)
                {
                    element.Area = (double)areaQty.AreaValue;
                }
                else if (quantity is IIfcQuantityLength lengthQty)
                {
                    element.Length = (double)lengthQty.LengthValue;
                }
            }

            // Bounding Box (simplificado)
            if (product.Representation != null)
            {
                // Nota: Cálculo de bounding box completo requer Xbim.Geometry
                // Por ora, deixar como null - pode ser implementado depois
                element.BoundingBox = null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao extrair geometria do elemento {IfcId}", element.IfcId);
        }
    }

    private void ExtractHierarchy(IIfcProduct product, BIMElement element)
    {
        try
        {
            // Extrair pai (contenção espacial)
            var containedIn = product.Decomposes?.FirstOrDefault();
            if (containedIn?.RelatingObject is IIfcProduct parent)
            {
                // ParentId será resolvido em segunda passagem (após todos elementos serem criados)
                element.Properties["ParentGlobalId"] = parent.GlobalId.ToString();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao extrair hierarquia do elemento {IfcId}", element.IfcId);
        }
    }

    private void ExtractLocation(IIfcProduct product, BIMElement element)
    {
        try
        {
            // Simplificado: extrair andar do nome do produto ou deixar para implementação futura
            // A API Xbim tem diferentes versões e interfaces
            // Por ora, deixar BuildingStorey e Level como null será preenchido manualmente
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao extrair localização do elemento {IfcId}", element.IfcId);
        }
    }

    public async Task<List<BIMElement>> GetModelElementsAsync(Guid modelId)
    {
        return await _context.BIMElements
            .Find(e => e.ModelId == modelId)
            .ToListAsync();
    }

    public async Task<BIMElement?> GetElementByIdAsync(Guid elementId)
    {
        return await _context.BIMElements
            .Find(e => e.Id == elementId)
            .FirstOrDefaultAsync();
    }

    public async Task<List<BIMElement>> GetElementsByTypeAsync(Guid modelId, string ifcType)
    {
        return await _context.BIMElements
            .Find(e => e.ModelId == modelId && e.IfcType == ifcType)
            .ToListAsync();
    }

    public async Task<List<ElementTypeSummary>> GetElementTypeSummaryAsync(Guid modelId)
    {
        var elements = await _context.BIMElements
            .Find(e => e.ModelId == modelId)
            .ToListAsync();

        return elements
            .GroupBy(e => e.IfcType)
            .Select(g => new ElementTypeSummary
            {
                IfcType = g.Key,
                Count = g.Count(),
                TotalVolume = g.Sum(e => e.Volume),
                TotalArea = g.Sum(e => e.Area)
            })
            .OrderByDescending(s => s.Count)
            .ToList();
    }
}
