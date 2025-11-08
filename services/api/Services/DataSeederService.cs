using MongoDB.Driver;
using Shancrys.Api.Data;
using Shancrys.Api.Models;

namespace Shancrys.Api.Services;

public class DataSeederService
{
    private readonly MongoDbContext _context;
    private readonly ILogger<DataSeederService> _logger;

    public DataSeederService(MongoDbContext context, ILogger<DataSeederService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedDemoDataAsync()
    {
        try
        {
            _logger.LogInformation("Iniciando seed de dados de demonstração...");

            // Seed planos de assinatura primeiro
            await SeedSubscriptionPlansAsync();

            _logger.LogInformation("Seed de planos concluído. Seed antigo desabilitado temporariamente.");
            
            // TODO: Corrigir seed antigo de projetos quando necessário
            /* 
            // Verificar se já existe dados
            var existingProjects = await _context.Projects.Find(_ => true).AnyAsync();
            if (existingProjects)
            {
                _logger.LogInformation("Dados já existem. Pulando seed.");
                return;
            }

            var tenantId = Guid.NewGuid().ToString();
            var userId = Guid.NewGuid().ToString();

            // Criar projeto de exemplo
            var project = new Project
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                Name = "Edifício Comercial Demo",
                Description = "Projeto de demonstração - Edifício comercial de 12 andares",
                Location = "São Paulo - SP",
                StartDate = DateTime.UtcNow.AddMonths(-3),
                EndDate = DateTime.UtcNow.AddMonths(15),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = userId,
                Version = 1
            };

            await _context.Projects.InsertOneAsync(project);
            _logger.LogInformation("Projeto '{ProjectName}' criado com ID: {ProjectId}", project.Name, project.Id);

            // Criar modelo BIM de exemplo
            var model = new BimModel
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                ProjectId = project.Id,
                Name = "Modelo Arquitetônico - Rev 01",
                Description = "Modelo IFC da arquitetura do edifício",
                FileFormat = "IFC",
                FileSize = 125000000, // 125 MB
                Status = "processed",
                UploadedAt = DateTime.UtcNow.AddDays(-7),
                UploadedBy = userId,
                ProcessedAt = DateTime.UtcNow.AddDays(-7).AddHours(2),
                Version = 1,
                BoundingBox = new BoundingBox
                {
                    MinX = 0, MinY = 0, MinZ = 0,
                    MaxX = 50, MaxY = 30, MaxZ = 42 // Dimensões aproximadas em metros
                }
            };

            await _context.Models.InsertOneAsync(model);
            _logger.LogInformation("Modelo BIM '{ModelName}' criado com ID: {ModelId}", model.Name, model.Id);

            // Criar elementos BIM de exemplo
            var elements = new List<BimElement>
            {
                new BimElement
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ModelId = model.Id,
                    GlobalId = "2CZxReVkX9Qu8hUbUq0123",
                    IfcType = "IfcWall",
                    Name = "Parede Externa - Fachada Norte",
                    Category = "Walls",
                    Material = "Concreto",
                    Geometry = new Geometry
                    {
                        Type = "BRep",
                        Coordinates = new List<double> { 0, 0, 0, 50, 0, 3 }
                    }
                },
                new BimElement
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ModelId = model.Id,
                    GlobalId = "3DYxSeVkX9Qu8hUbUq0456",
                    IfcType = "IfcSlab",
                    Name = "Laje Piso Tipo - 1º Pavimento",
                    Category = "Floors",
                    Material = "Concreto Armado",
                    Geometry = new Geometry
                    {
                        Type = "Polygon",
                        Coordinates = new List<double> { 0, 0, 3, 50, 30, 3 }
                    }
                },
                new BimElement
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ModelId = model.Id,
                    GlobalId = "4EZxTeVkX9Qu8hUbUq0789",
                    IfcType = "IfcColumn",
                    Name = "Pilar P1",
                    Category = "Structural Columns",
                    Material = "Concreto Armado",
                    Geometry = new Geometry
                    {
                        Type = "Cylinder",
                        Coordinates = new List<double> { 5, 5, 0, 5, 5, 42 }
                    }
                }
            };

            await _context.Elements.InsertManyAsync(elements);
            _logger.LogInformation("{ElementCount} elementos BIM criados", elements.Count);

            // Criar atividades de exemplo
            var activities = new List<ScheduleActivity>
            {
                new ScheduleActivity
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ProjectId = project.Id,
                    Code = "EST-001",
                    Name = "Fundações",
                    Description = "Execução de fundações profundas",
                    StartDate = DateTime.UtcNow.AddMonths(-2),
                    EndDate = DateTime.UtcNow.AddMonths(-1),
                    Duration = 30,
                    Status = "completed",
                    Progress = 100,
                    LinkedElementIds = new List<string>()
                },
                new ScheduleActivity
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ProjectId = project.Id,
                    Code = "EST-002",
                    Name = "Estrutura - Pilares e Lajes",
                    Description = "Execução da estrutura de concreto armado",
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    EndDate = DateTime.UtcNow.AddMonths(2),
                    Duration = 90,
                    Status = "in_progress",
                    Progress = 45,
                    LinkedElementIds = elements.Select(e => e.Id).ToList()
                },
                new ScheduleActivity
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ProjectId = project.Id,
                    Code = "ARQ-001",
                    Name = "Alvenaria e Vedações",
                    Description = "Execução de paredes de alvenaria",
                    StartDate = DateTime.UtcNow.AddMonths(1),
                    EndDate = DateTime.UtcNow.AddMonths(4),
                    Duration = 90,
                    Status = "planned",
                    Progress = 0,
                    LinkedElementIds = new List<string> { elements[0].Id }
                }
            };

            await _context.Activities.InsertManyAsync(activities);
            _logger.LogInformation("{ActivityCount} atividades de cronograma criadas", activities.Count);

            // Criar registros de progresso
            var progressRecords = new List<ProgressRecord>
            {
                new ProgressRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ActivityId = activities[0].Id,
                    Date = DateTime.UtcNow.AddMonths(-1).AddDays(-15),
                    Progress = 50,
                    RecordedBy = userId,
                    Notes = "50% das fundações executadas",
                    Photos = new List<string>()
                },
                new ProgressRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ActivityId = activities[0].Id,
                    Date = DateTime.UtcNow.AddMonths(-1),
                    Progress = 100,
                    RecordedBy = userId,
                    Notes = "Fundações concluídas",
                    Photos = new List<string>()
                },
                new ProgressRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ActivityId = activities[1].Id,
                    Date = DateTime.UtcNow.AddDays(-7),
                    Progress = 45,
                    RecordedBy = userId,
                    Notes = "Estrutura até o 5º pavimento concluída",
                    Photos = new List<string>()
                }
            };

            await _context.ProgressRecords.InsertManyAsync(progressRecords);
            _logger.LogInformation("{ProgressCount} registros de progresso criados", progressRecords.Count);

            _logger.LogInformation("✅ Seed de dados de demonstração concluído com sucesso!");
            _logger.LogInformation("   - 1 Projeto");
            _logger.LogInformation("   - 1 Modelo BIM");
            _logger.LogInformation("   - {ElementCount} Elementos", elements.Count);
            _logger.LogInformation("   - {ActivityCount} Atividades", activities.Count);
            _logger.LogInformation("   - {ProgressCount} Registros de Progresso", progressRecords.Count);
            */
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao executar seed de dados");
            throw;
        }
    }

    private async Task SeedSubscriptionPlansAsync()
    {
        var existingPlans = await _context.SubscriptionPlans.Find(_ => true).AnyAsync();
        if (existingPlans)
        {
            _logger.LogInformation("Planos de assinatura já existem. Pulando seed.");
            return;
        }

        var plans = new List<SubscriptionPlan>
        {
            new SubscriptionPlan
            {
                Id = "free",
                Name = "Free",
                Description = "Plano gratuito para explorar a plataforma",
                StripeProductId = "prod_free",
                StripePriceId = "price_free",
                PriceMonthly = 0,
                PriceYearly = 0,
                Currency = "BRL",
                Features = new PlanFeatures
                {
                    MaxProjects = 1,
                    MaxUsers = 3,
                    MaxStorageGB = 1,
                    MaxModelsPerProject = 1,
                    HasAdvancedAnalytics = false,
                    Has4DSimulation = false,
                    HasOfflineSync = false,
                    HasAPIAccess = false,
                    HasPrioritySupport = false,
                    HasCustomBranding = false,
                    HasSSOIntegration = false
                },
                IsActive = true,
                SortOrder = 1
            },
            new SubscriptionPlan
            {
                Id = "pro",
                Name = "Pro",
                Description = "Plano profissional para equipes de construção",
                StripeProductId = "prod_pro",
                StripePriceId = "price_pro_monthly",
                PriceMonthly = 299.90m,
                PriceYearly = 2999.00m,
                Currency = "BRL",
                Features = new PlanFeatures
                {
                    MaxProjects = 10,
                    MaxUsers = 20,
                    MaxStorageGB = 50,
                    MaxModelsPerProject = 5,
                    HasAdvancedAnalytics = true,
                    Has4DSimulation = true,
                    HasOfflineSync = true,
                    HasAPIAccess = true,
                    HasPrioritySupport = false,
                    HasCustomBranding = false,
                    HasSSOIntegration = false
                },
                IsActive = true,
                SortOrder = 2
            },
            new SubscriptionPlan
            {
                Id = "enterprise",
                Name = "Enterprise",
                Description = "Plano corporativo com recursos avançados e suporte prioritário",
                StripeProductId = "prod_enterprise",
                StripePriceId = "price_enterprise_monthly",
                PriceMonthly = 999.90m,
                PriceYearly = 9999.00m,
                Currency = "BRL",
                Features = new PlanFeatures
                {
                    MaxProjects = -1, // Ilimitado
                    MaxUsers = -1,    // Ilimitado
                    MaxStorageGB = 500,
                    MaxModelsPerProject = -1, // Ilimitado
                    HasAdvancedAnalytics = true,
                    Has4DSimulation = true,
                    HasOfflineSync = true,
                    HasAPIAccess = true,
                    HasPrioritySupport = true,
                    HasCustomBranding = true,
                    HasSSOIntegration = true
                },
                IsActive = true,
                SortOrder = 3
            }
        };

        await _context.SubscriptionPlans.InsertManyAsync(plans);
        _logger.LogInformation("✅ {PlanCount} planos de assinatura criados", plans.Count);
    }
}

