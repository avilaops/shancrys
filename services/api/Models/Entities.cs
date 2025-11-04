using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Shancrys.Api.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid TenantId { get; set; }
    
    [BsonElement("email")]
    public required string Email { get; set; }
    
    [BsonElement("passwordHash")]
    public required string PasswordHash { get; set; }
    
    [BsonElement("name")]
    public required string Name { get; set; }
    
    [BsonElement("roles")]
    public List<string> Roles { get; set; } = new();
    
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonElement("lastLoginAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? LastLoginAt { get; set; }
}

public class Project
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid TenantId { get; set; }
    
    public required string Name { get; set; }
    public required string Location { get; set; }
    public string? Description { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum ProjectStatus
{
    Planning,
    Active,
    Paused,
    Completed
}

public class ModelVersion
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid ProjectId { get; set; }
    
    public required string FileName { get; set; }
    public required string FilePath { get; set; }
    public long FileSize { get; set; }
    public required string FileHash { get; set; }
    public required string Format { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public FileType FileType { get; set; }
    
    public string? Description { get; set; }
    public int Version { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    [BsonRepresentation(BsonType.String)]
    public ModelStatus Status { get; set; } = ModelStatus.Processing;
    
    public Dictionary<string, object> Stats { get; set; } = new();
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonRepresentation(BsonType.String)]
    public Guid CreatedBy { get; set; }
    
    [BsonIgnore]
    public Project? Project { get; set; }
}

public enum FileType
{
    IFC,
    DGN,
    RVT
}

public enum ModelStatus
{
    Uploaded,
    Processing,
    Ready,
    Failed
}

public class Element
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid ModelVersionId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid VersionId { get; set; }
    
    public required string IfcGuid { get; set; }
    public required string Guid { get; set; }
    public required string Name { get; set; }
    public required string Type { get; set; }
    public required string Discipline { get; set; }
    public string? Level { get; set; }
    public double[]? BoundingBox { get; set; }
    public double? VolumeEstimated { get; set; }
    public decimal? CostEstimated { get; set; }
    public Dictionary<string, object> Properties { get; set; } = new();
    public Dictionary<string, object>? Attributes { get; set; }
    
    [BsonIgnore]
    public ModelVersion? ModelVersion { get; set; }
    
    public Element()
    {
        Id = System.Guid.NewGuid();
    }
}

public class Activity
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid ProjectId { get; set; }
    
    public required string Wbs { get; set; }
    public required string WbsCode { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime PlannedStartDate { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime PlannedEndDate { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime StartPlanned { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime EndPlanned { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? ActualStartDate { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? ActualEndDate { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? StartActual { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? EndActual { get; set; }
    
    public int Duration { get; set; }
    public List<string> Predecessors { get; set; } = new();
    public decimal ProgressPercent { get; set; } = 0;
    public double Progress { get; set; } = 0;
    
    [BsonRepresentation(BsonType.String)]
    public ActivityStatus Status { get; set; } = ActivityStatus.NotStarted;
    
    public Dictionary<string, object> Metadata { get; set; } = new();
    
    [BsonIgnore]
    public Project? Project { get; set; }
}

public enum ActivityStatus
{
    NotStarted,
    InProgress,
    Completed,
    OnHold
}

public class ElementActivityMapping
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid ElementId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid ActivityId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public MappingType MappingType { get; set; } = MappingType.Manual;
    
    public decimal Confidence { get; set; } = 1.0m;
    public double Weight { get; set; } = 1.0;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonIgnore]
    public Element? Element { get; set; }
    
    [BsonIgnore]
    public Activity? Activity { get; set; }
}

public enum MappingType
{
    Manual,
    AutoGenerated,
    AIAssisted
}

public class ProgressRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid ActivityId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid? ElementId { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [BsonRepresentation(BsonType.String)]
    public ProgressType Type { get; set; }
    
    public double? Value { get; set; }
    public string? MediaUrl { get; set; }
    public Dictionary<string, object>? GeoLocation { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid Author { get; set; }
}

public enum ProgressType
{
    Percentage,
    Photo,
    Inspection
}

public class CostRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid ProjectId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid? ActivityId { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime Date { get; set; }
    
    public required string Category { get; set; }
    public decimal Value { get; set; }
}
