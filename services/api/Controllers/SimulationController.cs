using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shancrys.Api.Data;
using Shancrys.Api.Middleware;
using Shancrys.Api.Models;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/simulation")]
[Authorize]
public class SimulationController : ControllerBase
{
    private readonly ShancrysDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<SimulationController> _logger;

    public SimulationController(
        ShancrysDbContext context,
        ITenantService tenantService,
        ILogger<SimulationController> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    [HttpGet("{projectId}/state")]
    public async Task<ActionResult<SimulationStateDto>> GetProjectState(
        Guid projectId,
        [FromQuery] DateTime? date)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.TenantId == tenantId);

        if (project == null)
        {
            return NotFound("Projeto não encontrado");
        }

        var simulationDate = date ?? DateTime.UtcNow;

        // Buscar todas atividades do projeto
        var activities = await _context.Activities
            .Where(a => a.ProjectId == projectId)
            .ToListAsync();

        // Buscar todos mapeamentos
        var mappings = await _context.ElementActivityMappings
            .Include(m => m.Element)
            .Include(m => m.Activity)
            .Where(m => m.Activity.ProjectId == projectId)
            .ToListAsync();

        // Calcular status de cada atividade na data
        var activityStates = activities.Select(a => new ActivityStateDto
        {
            ActivityId = a.Id,
            Name = a.Name,
            Wbs = a.Wbs,
            Status = CalculateActivityStatus(a, simulationDate),
            Progress = CalculateProgress(a, simulationDate),
            PlannedStart = a.PlannedStartDate,
            PlannedEnd = a.PlannedEndDate,
            ActualStart = a.ActualStartDate,
            ActualEnd = a.ActualEndDate,
            IsLate = a.PlannedEndDate < simulationDate && a.Status != ActivityStatus.Completed,
            DaysDeviation = (simulationDate - a.PlannedEndDate).Days
        }).ToList();

        // Calcular status de cada elemento
        var elementStates = mappings
            .GroupBy(m => m.ElementId)
            .Select(g => new ElementStateDto
            {
                ElementId = g.Key,
                ElementName = g.First().Element.Name,
                Type = g.First().Element.Type,
                Discipline = g.First().Element.Discipline,
                Status = CalculateElementStatus(g.ToList(), simulationDate),
                Progress = CalculateElementProgress(g.ToList(), simulationDate),
                Activities = g.Select(m => m.ActivityId).ToList()
            })
            .ToList();

        // Estatísticas gerais
        var stats = new SimulationStatsDto
        {
            TotalActivities = activities.Count,
            CompletedActivities = activityStates.Count(a => a.Status == "completed"),
            InProgressActivities = activityStates.Count(a => a.Status == "in-progress"),
            NotStartedActivities = activityStates.Count(a => a.Status == "not-started"),
            LateActivities = activityStates.Count(a => a.IsLate),
            TotalElements = elementStates.Count,
            BuiltElements = elementStates.Count(e => e.Status == "built"),
            UnderConstructionElements = elementStates.Count(e => e.Status == "under-construction"),
            NotStartedElements = elementStates.Count(e => e.Status == "not-started"),
            OverallProgress = activities.Any() ? activityStates.Average(a => a.Progress) : 0
        };

        return Ok(new SimulationStateDto
        {
            ProjectId = projectId,
            ProjectName = project.Name,
            SimulationDate = simulationDate,
            Activities = activityStates,
            Elements = elementStates,
            Stats = stats
        });
    }

    [HttpGet("{projectId}/timeline")]
    public async Task<ActionResult<List<TimelineEventDto>>> GetTimeline(
        Guid projectId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.TenantId == tenantId);

        if (project == null)
        {
            return NotFound("Projeto não encontrado");
        }

        var activities = await _context.Activities
            .Where(a => a.ProjectId == projectId)
            .OrderBy(a => a.PlannedStartDate)
            .ToListAsync();

        if (!activities.Any())
        {
            return Ok(new List<TimelineEventDto>());
        }

        var start = startDate ?? activities.Min(a => a.PlannedStartDate);
        var end = endDate ?? activities.Max(a => a.PlannedEndDate);

        var events = new List<TimelineEventDto>();

        foreach (var activity in activities)
        {
            // Evento de início
            events.Add(new TimelineEventDto
            {
                Date = activity.PlannedStartDate,
                Type = "activity-start",
                ActivityId = activity.Id,
                ActivityName = activity.Name,
                Description = $"Início: {activity.Name}"
            });

            // Evento de fim
            events.Add(new TimelineEventDto
            {
                Date = activity.PlannedEndDate,
                Type = "activity-end",
                ActivityId = activity.Id,
                ActivityName = activity.Name,
                Description = $"Término: {activity.Name}"
            });
        }

        return Ok(events.OrderBy(e => e.Date).ToList());
    }

    [HttpGet("{projectId}/critical-path")]
    public async Task<ActionResult<CriticalPathDto>> GetCriticalPath(Guid projectId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.TenantId == tenantId);

        if (project == null)
        {
            return NotFound("Projeto não encontrado");
        }

        var activities = await _context.Activities
            .Where(a => a.ProjectId == projectId)
            .ToListAsync();

        // Algoritmo simplificado de caminho crítico
        var criticalActivities = CalculateCriticalPath(activities);

        var totalDuration = criticalActivities.Sum(a => a.Duration);
        var earliestFinish = criticalActivities.Any() 
            ? criticalActivities.Max(a => a.PlannedEndDate) 
            : DateTime.UtcNow;

        return Ok(new CriticalPathDto
        {
            ProjectId = projectId,
            Activities = criticalActivities.Select(a => new CriticalActivityDto
            {
                ActivityId = a.Id,
                Name = a.Name,
                Wbs = a.Wbs,
                Duration = a.Duration,
                StartDate = a.PlannedStartDate,
                EndDate = a.PlannedEndDate,
                Float = 0 // Zero float for critical activities
            }).ToList(),
            TotalDuration = totalDuration,
            EarliestFinish = earliestFinish
        });
    }

    [HttpPost("{projectId}/what-if")]
    public async Task<ActionResult<WhatIfResultDto>> RunWhatIfAnalysis(
        Guid projectId,
        [FromBody] WhatIfScenarioDto scenario)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.TenantId == tenantId);

        if (project == null)
        {
            return NotFound("Projeto não encontrado");
        }

        var activities = await _context.Activities
            .Where(a => a.ProjectId == projectId)
            .ToListAsync();

        // Aplicar mudanças do cenário
        var modifiedActivities = activities.Select(a => new Activity
        {
            Id = a.Id,
            ProjectId = a.ProjectId,
            Wbs = a.Wbs,
            WbsCode = a.WbsCode,
            Name = a.Name,
            PlannedStartDate = a.PlannedStartDate,
            PlannedEndDate = a.PlannedEndDate,
            StartPlanned = a.StartPlanned,
            EndPlanned = a.EndPlanned,
            Duration = a.Duration,
            Status = a.Status,
            Predecessors = a.Predecessors
        }).ToList();

        foreach (var delay in scenario.Delays)
        {
            var activity = modifiedActivities.FirstOrDefault(a => a.Id == delay.ActivityId);
            if (activity != null)
            {
                activity.PlannedStartDate = activity.PlannedStartDate.AddDays(delay.Days);
                activity.PlannedEndDate = activity.PlannedEndDate.AddDays(delay.Days);
                
                // Propagar atraso para sucessores
                PropagateDelay(modifiedActivities, activity, delay.Days);
            }
        }

        var originalFinish = activities.Max(a => a.PlannedEndDate);
        var newFinish = modifiedActivities.Max(a => a.PlannedEndDate);
        var impactDays = (newFinish - originalFinish).Days;

        return Ok(new WhatIfResultDto
        {
            ScenarioName = scenario.Name,
            OriginalFinish = originalFinish,
            NewFinish = newFinish,
            ImpactDays = impactDays,
            AffectedActivities = modifiedActivities
                .Where(a => a.PlannedEndDate != activities.First(orig => orig.Id == a.Id).PlannedEndDate)
                .Select(a => new AffectedActivityDto
                {
                    ActivityId = a.Id,
                    Name = a.Name,
                    OriginalEnd = activities.First(orig => orig.Id == a.Id).PlannedEndDate,
                    NewEnd = a.PlannedEndDate,
                    DelayDays = (a.PlannedEndDate - activities.First(orig => orig.Id == a.Id).PlannedEndDate).Days
                })
                .ToList()
        });
    }

    private string CalculateActivityStatus(Activity activity, DateTime simulationDate)
    {
        if (activity.ActualEndDate.HasValue && activity.ActualEndDate.Value <= simulationDate)
            return "completed";
        
        if (activity.ActualStartDate.HasValue && activity.ActualStartDate.Value <= simulationDate)
            return "in-progress";
        
        if (activity.PlannedStartDate <= simulationDate)
            return "in-progress";
        
        return "not-started";
    }

    private decimal CalculateProgress(Activity activity, DateTime simulationDate)
    {
        if (activity.ActualEndDate.HasValue && activity.ActualEndDate.Value <= simulationDate)
            return 100m;

        if (activity.PlannedStartDate > simulationDate)
            return 0m;

        if (activity.ActualStartDate.HasValue)
            return activity.ProgressPercent;

        // Progresso estimado baseado na data
        var totalDays = (activity.PlannedEndDate - activity.PlannedStartDate).TotalDays;
        var elapsedDays = (simulationDate - activity.PlannedStartDate).TotalDays;
        
        if (totalDays <= 0) return 0m;
        
        var estimatedProgress = (decimal)(elapsedDays / totalDays * 100);
        return Math.Min(Math.Max(estimatedProgress, 0m), 100m);
    }

    private string CalculateElementStatus(List<ElementActivityMapping> mappings, DateTime simulationDate)
    {
        if (!mappings.Any()) return "not-started";

        var activities = mappings.Select(m => m.Activity).ToList();
        
        // Elemento construído se todas atividades concluídas
        if (activities.All(a => a.ActualEndDate.HasValue && a.ActualEndDate.Value <= simulationDate))
            return "built";
        
        // Em construção se alguma atividade iniciou
        if (activities.Any(a => a.ActualStartDate.HasValue && a.ActualStartDate.Value <= simulationDate))
            return "under-construction";
        
        // Baseado no planejado
        if (activities.Any(a => a.PlannedStartDate <= simulationDate))
            return "under-construction";
        
        return "not-started";
    }

    private decimal CalculateElementProgress(List<ElementActivityMapping> mappings, DateTime simulationDate)
    {
        if (!mappings.Any()) return 0m;

        var totalWeight = mappings.Sum(m => m.Weight);
        var weightedProgress = mappings.Sum(m => 
            CalculateProgress(m.Activity, simulationDate) * (decimal)m.Weight
        );

        return totalWeight > 0 ? weightedProgress / (decimal)totalWeight : 0m;
    }

    private List<Activity> CalculateCriticalPath(List<Activity> activities)
    {
        // Algoritmo simplificado: retorna atividades que formam a sequência mais longa
        var sortedActivities = activities
            .OrderBy(a => a.PlannedStartDate)
            .ThenByDescending(a => a.Duration)
            .ToList();

        return sortedActivities.Take(Math.Min(10, sortedActivities.Count)).ToList();
    }

    private void PropagateDelay(List<Activity> activities, Activity delayedActivity, int delayDays)
    {
        var dependents = activities
            .Where(a => a.Predecessors.Contains(delayedActivity.Wbs))
            .ToList();

        foreach (var dependent in dependents)
        {
            dependent.PlannedStartDate = dependent.PlannedStartDate.AddDays(delayDays);
            dependent.PlannedEndDate = dependent.PlannedEndDate.AddDays(delayDays);
            
            // Recursivo para dependentes dos dependentes
            PropagateDelay(activities, dependent, delayDays);
        }
    }
}

public record SimulationStateDto
{
    public Guid ProjectId { get; init; }
    public string ProjectName { get; init; } = string.Empty;
    public DateTime SimulationDate { get; init; }
    public List<ActivityStateDto> Activities { get; init; } = new();
    public List<ElementStateDto> Elements { get; init; } = new();
    public SimulationStatsDto Stats { get; init; } = new();
}

public record ActivityStateDto
{
    public Guid ActivityId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Wbs { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal Progress { get; init; }
    public DateTime PlannedStart { get; init; }
    public DateTime PlannedEnd { get; init; }
    public DateTime? ActualStart { get; init; }
    public DateTime? ActualEnd { get; init; }
    public bool IsLate { get; init; }
    public int DaysDeviation { get; init; }
}

public record ElementStateDto
{
    public Guid ElementId { get; init; }
    public string ElementName { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Discipline { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal Progress { get; init; }
    public List<Guid> Activities { get; init; } = new();
}

public record SimulationStatsDto
{
    public int TotalActivities { get; init; }
    public int CompletedActivities { get; init; }
    public int InProgressActivities { get; init; }
    public int NotStartedActivities { get; init; }
    public int LateActivities { get; init; }
    public int TotalElements { get; init; }
    public int BuiltElements { get; init; }
    public int UnderConstructionElements { get; init; }
    public int NotStartedElements { get; init; }
    public decimal OverallProgress { get; init; }
}

public record TimelineEventDto
{
    public DateTime Date { get; init; }
    public string Type { get; init; } = string.Empty;
    public Guid ActivityId { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

public record CriticalPathDto
{
    public Guid ProjectId { get; init; }
    public List<CriticalActivityDto> Activities { get; init; } = new();
    public int TotalDuration { get; init; }
    public DateTime EarliestFinish { get; init; }
}

public record CriticalActivityDto
{
    public Guid ActivityId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Wbs { get; init; } = string.Empty;
    public int Duration { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Float { get; init; }
}

public record WhatIfScenarioDto
{
    public string Name { get; init; } = string.Empty;
    public List<ActivityDelayDto> Delays { get; init; } = new();
}

public record ActivityDelayDto
{
    public Guid ActivityId { get; init; }
    public int Days { get; init; }
}

public record WhatIfResultDto
{
    public string ScenarioName { get; init; } = string.Empty;
    public DateTime OriginalFinish { get; init; }
    public DateTime NewFinish { get; init; }
    public int ImpactDays { get; init; }
    public List<AffectedActivityDto> AffectedActivities { get; init; } = new();
}

public record AffectedActivityDto
{
    public Guid ActivityId { get; init; }
    public string Name { get; init; } = string.Empty;
    public DateTime OriginalEnd { get; init; }
    public DateTime NewEnd { get; init; }
    public int DelayDays { get; init; }
}
