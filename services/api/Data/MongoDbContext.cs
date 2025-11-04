using MongoDB.Driver;
using Shancrys.Api.Models;

namespace Shancrys.Api.Data;

public interface IMongoDbContext
{
    IMongoCollection<User> Users { get; }
    IMongoCollection<Project> Projects { get; }
    IMongoCollection<ModelVersion> ModelVersions { get; }
    IMongoCollection<Element> Elements { get; }
    IMongoCollection<Activity> Activities { get; }
    IMongoCollection<ElementActivityMapping> ElementActivityMappings { get; }
    IMongoCollection<ProgressRecord> ProgressRecords { get; }
    IMongoCollection<CostRecord> CostRecords { get; }
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
    public IMongoCollection<Project> Projects => _database.GetCollection<Project>("projects");
    public IMongoCollection<ModelVersion> ModelVersions => _database.GetCollection<ModelVersion>("modelVersions");
    public IMongoCollection<Element> Elements => _database.GetCollection<Element>("elements");
    public IMongoCollection<Activity> Activities => _database.GetCollection<Activity>("activities");
    public IMongoCollection<ElementActivityMapping> ElementActivityMappings => _database.GetCollection<ElementActivityMapping>("elementActivityMappings");
    public IMongoCollection<ProgressRecord> ProgressRecords => _database.GetCollection<ProgressRecord>("progressRecords");
    public IMongoCollection<CostRecord> CostRecords => _database.GetCollection<CostRecord>("costRecords");

    private void CreateIndexes()
    {
        // Índices para User
        var userIndexKeys = Builders<User>.IndexKeys.Ascending(u => u.Email);
        var userIndexOptions = new CreateIndexOptions { Unique = true };
        Users.Indexes.CreateOne(new CreateIndexModel<User>(userIndexKeys, userIndexOptions));
        
        Users.Indexes.CreateOne(new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.TenantId)));

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
    }
}
