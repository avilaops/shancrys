namespace Shancrys.Api.Models.DTOs;

public class BIMElementDto
{
    public Guid Id { get; set; }
    public Guid ModelId { get; set; }
    public Guid ProjectId { get; set; }
    public string IfcId { get; set; } = string.Empty;
    public int EntityLabel { get; set; }
    public string IfcType { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? GlobalId { get; set; }
    public Guid? ParentId { get; set; }
    public List<Guid>? ChildrenIds { get; set; }
    public string? BuildingStorey { get; set; }
    public int? Level { get; set; }
    public Dictionary<string, object> Properties { get; set; } = new();
    public Dictionary<string, string> Materials { get; set; } = new();
    public BoundingBoxDto? BoundingBox { get; set; }
    public double Volume { get; set; }
    public double Area { get; set; }
    public double Length { get; set; }
    public Guid? LinkedActivityId { get; set; }
    public DateTime ExtractedAt { get; set; }
}

public class BoundingBoxDto
{
    public Point3DDto Min { get; set; } = new();
    public Point3DDto Max { get; set; } = new();
}

public class Point3DDto
{
    public double X { get; set; }
    public double Y { get; set; }
    public double Z { get; set; }
}

public class BIMElementSummaryDto
{
    public Guid Id { get; set; }
    public string IfcId { get; set; } = string.Empty;
    public string IfcType { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? BuildingStorey { get; set; }
    public int? Level { get; set; }
    public double Volume { get; set; }
    public double Area { get; set; }
    public double Length { get; set; }
    public Guid? LinkedActivityId { get; set; }
    public bool HasActivity { get; set; }
}

public class LinkElementsToActivityRequest
{
    public Guid ActivityId { get; set; }
    public List<Guid> ElementIds { get; set; } = new();
}

public class LinkElementsResponse
{
    public Guid ActivityId { get; set; }
    public int LinkedCount { get; set; }
    public List<Guid> ElementIds { get; set; } = new();
}

public class ElementFilterRequest
{
    public List<string>? IfcTypes { get; set; }
    public string? BuildingStorey { get; set; }
    public int? Level { get; set; }
    public string? SearchTerm { get; set; }
    public bool? HasActivity { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class ElementsPagedResponse
{
    public List<BIMElementSummaryDto> Elements { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class ElementTypeSummary
{
    public string IfcType { get; set; } = string.Empty;
    public int Count { get; set; }
    public double TotalVolume { get; set; }
    public double TotalArea { get; set; }
}

public class ParseIFCResponse
{
    public Guid ModelId { get; set; }
    public int ElementsCount { get; set; }
    public List<ElementTypeSummary> TypesSummary { get; set; } = new();
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime ParsedAt { get; set; }
}
