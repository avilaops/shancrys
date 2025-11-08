using MongoDB.Driver;
using Shancrys.Api.Models;

namespace Shancrys.Api.Data;

public interface IMongoDbContext
{
    IMongoCollection<User> Users { get; }
    IMongoCollection<RefreshToken> RefreshTokens { get; }
    IMongoCollection<Project> Projects { get; }
    IMongoCollection<ModelVersion> ModelVersions { get; }
    IMongoCollection<BIMElement> BIMElements { get; }
    IMongoCollection<Element> Elements { get; }
    IMongoCollection<Activity> Activities { get; }
    IMongoCollection<ElementActivityMapping> ElementActivityMappings { get; }
    IMongoCollection<ProgressRecord> ProgressRecords { get; }
    IMongoCollection<CostRecord> CostRecords { get; }
    IMongoCollection<SubscriptionPlan> SubscriptionPlans { get; }
    IMongoCollection<Subscription> Subscriptions { get; }
    IMongoCollection<Invoice> Invoices { get; }
    IMongoCollection<Payment> Payments { get; }
    IMongoCollection<UsageRecord> UsageRecords { get; }
    
    // Engenharia Civil
    IMongoCollection<Material> Materiais { get; }
    IMongoCollection<ComposicaoCusto> ComposicoesCusto { get; }
    IMongoCollection<MaoDeObra> MaoDeObra { get; }
    IMongoCollection<Equipamento> Equipamentos { get; }
}

public class MongoDbContext : IMongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IMongoClient client, IConfiguration configuration)
    {
        var databaseName = configuration.GetValue<string>("MongoDB:DatabaseName") ?? "shancrys";
        _database = client.GetDatabase(databaseName);
        
        // Criar índices para otimização
        CreateIndexes();
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<RefreshToken> RefreshTokens => _database.GetCollection<RefreshToken>("refreshTokens");
    public IMongoCollection<Project> Projects => _database.GetCollection<Project>("projects");
    public IMongoCollection<ModelVersion> ModelVersions => _database.GetCollection<ModelVersion>("modelVersions");
    public IMongoCollection<BIMElement> BIMElements => _database.GetCollection<BIMElement>("bimElements");
    public IMongoCollection<Element> Elements => _database.GetCollection<Element>("elements");
    public IMongoCollection<Activity> Activities => _database.GetCollection<Activity>("activities");
    public IMongoCollection<ElementActivityMapping> ElementActivityMappings => _database.GetCollection<ElementActivityMapping>("elementActivityMappings");
    public IMongoCollection<ProgressRecord> ProgressRecords => _database.GetCollection<ProgressRecord>("progressRecords");
    public IMongoCollection<CostRecord> CostRecords => _database.GetCollection<CostRecord>("costRecords");
    public IMongoCollection<SubscriptionPlan> SubscriptionPlans => _database.GetCollection<SubscriptionPlan>("subscriptionPlans");
    public IMongoCollection<Subscription> Subscriptions => _database.GetCollection<Subscription>("subscriptions");
    public IMongoCollection<Invoice> Invoices => _database.GetCollection<Invoice>("invoices");
    public IMongoCollection<Payment> Payments => _database.GetCollection<Payment>("payments");
    public IMongoCollection<UsageRecord> UsageRecords => _database.GetCollection<UsageRecord>("usageRecords");
    
    // Engenharia Civil
    public IMongoCollection<Material> Materiais => _database.GetCollection<Material>("materiais");
    public IMongoCollection<ComposicaoCusto> ComposicoesCusto => _database.GetCollection<ComposicaoCusto>("composicoesCusto");
    public IMongoCollection<MaoDeObra> MaoDeObra => _database.GetCollection<MaoDeObra>("maoDeObra");
    public IMongoCollection<Equipamento> Equipamentos => _database.GetCollection<Equipamento>("equipamentos");

    private void CreateIndexes()
    {
        // Índices para User
        var userIndexKeys = Builders<User>.IndexKeys.Ascending(u => u.Email);
        var userIndexOptions = new CreateIndexOptions { Unique = true };
        Users.Indexes.CreateOne(new CreateIndexModel<User>(userIndexKeys, userIndexOptions));
        
        Users.Indexes.CreateOne(new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.TenantId)));
        
        // Índices para RefreshToken
        RefreshTokens.Indexes.CreateOne(new CreateIndexModel<RefreshToken>(
            Builders<RefreshToken>.IndexKeys.Ascending(rt => rt.UserId)));
        RefreshTokens.Indexes.CreateOne(new CreateIndexModel<RefreshToken>(
            Builders<RefreshToken>.IndexKeys.Ascending(rt => rt.Token)));
        RefreshTokens.Indexes.CreateOne(new CreateIndexModel<RefreshToken>(
            Builders<RefreshToken>.IndexKeys.Ascending(rt => rt.ExpiresAt)));

        // Índices para Project
        Projects.Indexes.CreateOne(new CreateIndexModel<Project>(
            Builders<Project>.IndexKeys.Ascending(p => p.TenantId)));

        // Índices para ModelVersion
        ModelVersions.Indexes.CreateOne(new CreateIndexModel<ModelVersion>(
            Builders<ModelVersion>.IndexKeys.Ascending(m => m.ProjectId)));

        // Índices para Element
        Elements.Indexes.CreateOne(new CreateIndexModel<Element>(
            Builders<Element>.IndexKeys.Ascending(e => e.VersionId)));
        Elements.Indexes.CreateOne(new CreateIndexModel<Element>(
            Builders<Element>.IndexKeys.Ascending(e => e.Discipline)));

        // Índices para Activity
        Activities.Indexes.CreateOne(new CreateIndexModel<Activity>(
            Builders<Activity>.IndexKeys.Ascending(a => a.ProjectId)));
        Activities.Indexes.CreateOne(new CreateIndexModel<Activity>(
            Builders<Activity>.IndexKeys.Ascending(a => a.StartPlanned)));

        // Índices para ElementActivityMapping
        var mappingIndexKeys = Builders<ElementActivityMapping>.IndexKeys
            .Ascending(m => m.ElementId)
            .Ascending(m => m.ActivityId);
        var mappingIndexOptions = new CreateIndexOptions { Unique = true };
        ElementActivityMappings.Indexes.CreateOne(
            new CreateIndexModel<ElementActivityMapping>(mappingIndexKeys, mappingIndexOptions));

        // Índices para ProgressRecord
        ProgressRecords.Indexes.CreateOne(new CreateIndexModel<ProgressRecord>(
            Builders<ProgressRecord>.IndexKeys.Ascending(p => p.ActivityId)));
        ProgressRecords.Indexes.CreateOne(new CreateIndexModel<ProgressRecord>(
            Builders<ProgressRecord>.IndexKeys.Ascending(p => p.Timestamp)));

        // Índices para CostRecord
        CostRecords.Indexes.CreateOne(new CreateIndexModel<CostRecord>(
            Builders<CostRecord>.IndexKeys.Ascending(c => c.ProjectId)));
        CostRecords.Indexes.CreateOne(new CreateIndexModel<CostRecord>(
            Builders<CostRecord>.IndexKeys.Ascending(c => c.Date)));

        // Índices para Billing
        Subscriptions.Indexes.CreateOne(new CreateIndexModel<Subscription>(
            Builders<Subscription>.IndexKeys.Ascending(s => s.TenantId)));
        Subscriptions.Indexes.CreateOne(new CreateIndexModel<Subscription>(
            Builders<Subscription>.IndexKeys.Ascending(s => s.StripeSubscriptionId)));

        Invoices.Indexes.CreateOne(new CreateIndexModel<Invoice>(
            Builders<Invoice>.IndexKeys.Ascending(i => i.TenantId)));
        Invoices.Indexes.CreateOne(new CreateIndexModel<Invoice>(
            Builders<Invoice>.IndexKeys.Ascending(i => i.SubscriptionId)));

        Payments.Indexes.CreateOne(new CreateIndexModel<Payment>(
            Builders<Payment>.IndexKeys.Ascending(p => p.TenantId)));
        Payments.Indexes.CreateOne(new CreateIndexModel<Payment>(
            Builders<Payment>.IndexKeys.Ascending(p => p.InvoiceId)));

        UsageRecords.Indexes.CreateOne(new CreateIndexModel<UsageRecord>(
            Builders<UsageRecord>.IndexKeys.Ascending(u => u.TenantId)));
        UsageRecords.Indexes.CreateOne(new CreateIndexModel<UsageRecord>(
            Builders<UsageRecord>.IndexKeys.Ascending(u => u.Timestamp)));
        
        // Índices para Materiais
        Materiais.Indexes.CreateOne(new CreateIndexModel<Material>(
            Builders<Material>.IndexKeys.Ascending(m => m.TenantId)));
        Materiais.Indexes.CreateOne(new CreateIndexModel<Material>(
            Builders<Material>.IndexKeys.Ascending(m => m.Codigo)));
        Materiais.Indexes.CreateOne(new CreateIndexModel<Material>(
            Builders<Material>.IndexKeys.Ascending(m => m.Categoria)));
        
        // Índices para Composições de Custo
        ComposicoesCusto.Indexes.CreateOne(new CreateIndexModel<ComposicaoCusto>(
            Builders<ComposicaoCusto>.IndexKeys.Ascending(c => c.TenantId)));
        ComposicoesCusto.Indexes.CreateOne(new CreateIndexModel<ComposicaoCusto>(
            Builders<ComposicaoCusto>.IndexKeys.Ascending(c => c.Codigo)));
        
        // Índices para Mão de Obra
        MaoDeObra.Indexes.CreateOne(new CreateIndexModel<MaoDeObra>(
            Builders<MaoDeObra>.IndexKeys.Ascending(m => m.TenantId)));
        
        // Índices para Equipamentos
        Equipamentos.Indexes.CreateOne(new CreateIndexModel<Equipamento>(
            Builders<Equipamento>.IndexKeys.Ascending(e => e.TenantId)));
    }
}
