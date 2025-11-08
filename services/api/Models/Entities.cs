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
    
    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;
    
    [BsonElement("emailVerified")]
    public bool EmailVerified { get; set; } = false;
    
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonElement("lastLoginAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? LastLoginAt { get; set; }
}

public class RefreshToken
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid UserId { get; set; }
    
    [BsonElement("token")]
    public required string Token { get; set; }
    
    [BsonElement("expiresAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime ExpiresAt { get; set; }
    
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonElement("revokedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? RevokedAt { get; set; }
    
    [BsonElement("replacedByToken")]
    public string? ReplacedByToken { get; set; }
    
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => RevokedAt == null && !IsExpired;
}

public class Project
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid TenantId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid CreatedBy { get; set; }
    
    public required string Name { get; set; }
    public required string Location { get; set; }
    public string? Description { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    
    [BsonElement("members")]
    public List<ProjectMember> Members { get; set; } = new();
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? StartDate { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? EndDate { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ProjectMember
{
    [BsonRepresentation(BsonType.String)]
    public Guid UserId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public ProjectRole Role { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}

public enum ProjectStatus
{
    Planning,
    Active,
    Paused,
    Completed
}

public enum ProjectRole
{
    Owner,
    Admin,
    Editor,
    Viewer
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
    
    public bool IsParsed { get; set; } = false;
    public int ElementsCount { get; set; } = 0;
    public DateTime? ParsedAt { get; set; }
    
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

public class BIMElement
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid ModelId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid ProjectId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid TenantId { get; set; }
    
    // IFC Properties
    public required string IfcId { get; set; }
    public int EntityLabel { get; set; }
    public required string IfcType { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? GlobalId { get; set; }
    
    // Hierarchy
    public Guid? ParentId { get; set; }
    public List<Guid> ChildrenIds { get; set; } = new();
    public string? BuildingStorey { get; set; }
    public int? Level { get; set; }
    
    // Properties
    public Dictionary<string, object> Properties { get; set; } = new();
    public Dictionary<string, string> Materials { get; set; } = new();
    
    // Geometry (simplified)
    public BoundingBox? BoundingBox { get; set; }
    public double Volume { get; set; }
    public double Area { get; set; }
    public double Length { get; set; }
    
    // Activity Link
    [BsonRepresentation(BsonType.String)]
    public Guid? LinkedActivityId { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime ExtractedAt { get; set; } = DateTime.UtcNow;
}

public class BoundingBox
{
    public Point3D Min { get; set; } = new();
    public Point3D Max { get; set; } = new();
}

public class Point3D
{
    public double X { get; set; }
    public double Y { get; set; }
    public double Z { get; set; }
}

public class Element
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid ProjectId { get; set; }
    
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

// ============================================================================
// BILLING & SUBSCRIPTION MODELS
// ============================================================================

public class SubscriptionPlan
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    public required string Name { get; set; }
    public required string Description { get; set; }
    
    public required string StripeProductId { get; set; }
    public required string StripePriceId { get; set; }
    
    public decimal PriceMonthly { get; set; }
    public decimal PriceYearly { get; set; }
    
    public string Currency { get; set; } = "BRL";
    
    public required PlanFeatures Features { get; set; }
    
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class PlanFeatures
{
    public int MaxProjects { get; set; }
    public int MaxUsers { get; set; }
    public long MaxStorageGB { get; set; }
    public int MaxModelsPerProject { get; set; }
    
    public bool HasAdvancedAnalytics { get; set; }
    public bool Has4DSimulation { get; set; }
    public bool HasOfflineSync { get; set; }
    public bool HasAPIAccess { get; set; }
    public bool HasPrioritySupport { get; set; }
    public bool HasCustomBranding { get; set; }
    public bool HasSSOIntegration { get; set; }
}

public class Subscription
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [BsonRepresentation(BsonType.String)]
    public required string TenantId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public required string PlanId { get; set; }
    
    public required string StripeSubscriptionId { get; set; }
    public required string StripeCustomerId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    
    [BsonRepresentation(BsonType.String)]
    public BillingInterval BillingInterval { get; set; } = BillingInterval.Monthly;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CurrentPeriodStart { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CurrentPeriodEnd { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? CanceledAt { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? TrialEnd { get; set; }
    
    public bool CancelAtPeriodEnd { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonIgnore]
    public SubscriptionPlan? Plan { get; set; }
}

public enum SubscriptionStatus
{
    Trialing,
    Active,
    PastDue,
    Canceled,
    Unpaid
}

public enum BillingInterval
{
    Monthly,
    Yearly
}

public class Invoice
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [BsonRepresentation(BsonType.String)]
    public required string TenantId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public required string SubscriptionId { get; set; }
    
    public required string StripeInvoiceId { get; set; }
    
    public required string InvoiceNumber { get; set; }
    
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    
    public string Currency { get; set; } = "BRL";
    
    [BsonRepresentation(BsonType.String)]
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? PaidAt { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime DueDate { get; set; }
    
    public string? InvoicePdfUrl { get; set; }
    public string? HostedInvoiceUrl { get; set; }
    
    public List<InvoiceLineItem> LineItems { get; set; } = new();
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonIgnore]
    public Subscription? Subscription { get; set; }
}

public class InvoiceLineItem
{
    public required string Description { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}

public enum InvoiceStatus
{
    Draft,
    Open,
    Paid,
    Void,
    Uncollectible
}

public class Payment
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [BsonRepresentation(BsonType.String)]
    public required string TenantId { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public required string InvoiceId { get; set; }
    
    public required string StripePaymentIntentId { get; set; }
    
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "BRL";
    
    [BsonRepresentation(BsonType.String)]
    public PaymentStatus Status { get; set; } = PaymentStatus.Processing;
    
    public required string PaymentMethod { get; set; }
    
    public string? FailureReason { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? ProcessedAt { get; set; }
    
    [BsonIgnore]
    public Invoice? Invoice { get; set; }
}

public enum PaymentStatus
{
    Processing,
    Succeeded,
    Failed,
    Canceled,
    Refunded
}

public class UsageRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [BsonRepresentation(BsonType.String)]
    public required string TenantId { get; set; }
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public required string MetricName { get; set; }
    public double Value { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
}

// ========================================
// ENGENHARIA CIVIL - MATERIAIS E CUSTOS
// ========================================

public class Material
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid TenantId { get; set; }
    
    // Identificação
    public required string Codigo { get; set; } // Ex: SINAPI 88316, SICRO 72957
    public required string Nome { get; set; }
    public string? Descricao { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public MaterialCategoria Categoria { get; set; }
    
    public required string Unidade { get; set; } // m³, m², m, un, kg, ton
    
    // Especificações Técnicas
    public MaterialEspecificacoes Especificacoes { get; set; } = new();
    
    // Custos
    public decimal PrecoUnitario { get; set; }
    public string Moeda { get; set; } = "BRL";
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime DataReferencia { get; set; } = DateTime.UtcNow;
    
    public string? Regiao { get; set; } // Ex: "SP-Capital", "RJ-Interior"
    public string? FontePreco { get; set; } // Ex: "SINAPI 12/2024", "Cotação Fornecedor"
    
    // Fornecedores
    public List<Fornecedor> Fornecedores { get; set; } = new();
    
    // Alternativas Equivalentes
    public List<Guid> AlternativasEquivalentes { get; set; } = new();
    
    // Sustentabilidade
    public double? PegadaCO2 { get; set; } // kg CO2 por unidade
    public bool Reciclavel { get; set; }
    public string? CertificacoesAmbientais { get; set; } // Ex: "LEED, AQUA"
    
    // Disponibilidade
    [BsonRepresentation(BsonType.String)]
    public DisponibilidadeMaterial Disponibilidade { get; set; } = DisponibilidadeMaterial.Imediata;
    
    public int PrazoEntregaDias { get; set; }
    
    // Controle
    public bool Ativo { get; set; } = true;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
    
    [BsonRepresentation(BsonType.String)]
    public Guid CriadoPor { get; set; }
}

public class MaterialEspecificacoes
{
    public string? Resistencia { get; set; } // Ex: "fck 25 MPa" para concreto
    public string? Dimensoes { get; set; } // Ex: "14x19x39cm" para blocos
    public string? Marca { get; set; }
    public string? Modelo { get; set; }
    public string? Cor { get; set; }
    public string? Acabamento { get; set; }
    public string? NormaTecnica { get; set; } // Ex: "NBR 6118:2014"
    public Dictionary<string, string> OutrasEspecificacoes { get; set; } = new();
}

public class Fornecedor
{
    public required string Nome { get; set; }
    public string? CNPJ { get; set; }
    public string? Contato { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Endereco { get; set; }
    public decimal? PrecoNegociado { get; set; }
    public int PrazoEntregaDias { get; set; }
    public string? CondicoesPagamento { get; set; }
    public double? AvaliacaoQualidade { get; set; } // 0-5 estrelas
}

public enum MaterialCategoria
{
    Estrutura,          // Concreto, aço, forma
    Alvenaria,          // Blocos, argamassa
    Revestimento,       // Reboco, cerâmica, pintura
    Instalacoes,        // Hidráulica, elétrica, gás
    Acabamento,         // Piso, parede, forro
    Impermeabilizacao,  // Mantas, lonas
    Esquadrias,         // Portas, janelas
    Metais,             // Torneiras, registros
    Loucas,             // Vasos, pias
    Diversos
}

public enum DisponibilidadeMaterial
{
    Imediata,
    SobEncomenda,
    LongaEspera,
    Descontinuado
}

public class ComposicaoCusto
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid TenantId { get; set; }
    
    // Identificação
    public required string Codigo { get; set; } // Ex: SINAPI 92707
    public required string Descricao { get; set; }
    public required string Unidade { get; set; }
    
    // Insumos
    public List<Insumo> Insumos { get; set; } = new();
    
    // Custos Calculados
    public decimal CustoMaterial { get; set; }
    public decimal CustoMaoDeObra { get; set; }
    public decimal CustoEquipamento { get; set; }
    public decimal CustoTotalUnitario { get; set; }
    
    public decimal PercentualBDI { get; set; } = 25.0m; // %
    public decimal CustoComBDI { get; set; }
    
    // Produtividade
    public Produtividade Produtividade { get; set; } = new() { UnidadeTempo = "hora" };
    
    // Controle
    public bool Ativo { get; set; } = true;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}

public class Insumo
{
    [BsonRepresentation(BsonType.String)]
    public TipoInsumo Tipo { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid ItemId { get; set; } // Referência ao Material, MaoDeObra ou Equipamento
    
    public required string Descricao { get; set; }
    public required string Unidade { get; set; }
    
    public decimal Coeficiente { get; set; } // Quantidade por unidade da composição
    public decimal CustoUnitario { get; set; }
    public decimal CustoTotal { get; set; } // Coeficiente * CustoUnitario
}

public enum TipoInsumo
{
    Material,
    MaoDeObra,
    Equipamento
}

public class Produtividade
{
    public required string UnidadeTempo { get; set; } // "hora", "dia"
    public decimal Quantidade { get; set; } // Ex: 10 m²/dia
    public decimal HorasHomem { get; set; } // Horas-homem por unidade
}

public class MaoDeObra
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid TenantId { get; set; }
    
    public required string Codigo { get; set; } // Ex: SINAPI 88316
    public required string Descricao { get; set; } // Ex: "Pedreiro com encargos"
    
    public decimal CustoHora { get; set; }
    public string Moeda { get; set; } = "BRL";
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime DataReferencia { get; set; } = DateTime.UtcNow;
    
    public string? Regiao { get; set; }
    public string? Categoria { get; set; } // "Oficial", "Servente", "Mestre de Obras"
    
    public bool Ativo { get; set; } = true;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}

public class Equipamento
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [BsonRepresentation(BsonType.String)]
    public Guid TenantId { get; set; }
    
    public required string Codigo { get; set; }
    public required string Descricao { get; set; } // Ex: "Betoneira 400L"
    
    public decimal CustoHora { get; set; }
    public string Moeda { get; set; } = "BRL";
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime DataReferencia { get; set; } = DateTime.UtcNow;
    
    public string? TipoEquipamento { get; set; } // "Betoneira", "Escavadeira", "Guindaste"
    public string? Especificacoes { get; set; }
    
    public bool Ativo { get; set; } = true;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
