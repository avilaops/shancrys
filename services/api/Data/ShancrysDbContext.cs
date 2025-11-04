using Microsoft.EntityFrameworkCore;
using Shancrys.Api.Models;

namespace Shancrys.Api.Data;

public class ShancrysDbContext : DbContext
{
    public ShancrysDbContext(DbContextOptions<ShancrysDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ModelVersion> ModelVersions => Set<ModelVersion>();
    public DbSet<Element> Elements => Set<Element>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<ElementActivityMapping> ElementActivityMappings => Set<ElementActivityMapping>();
    public DbSet<ProgressRecord> ProgressRecords => Set<ProgressRecord>();
    public DbSet<CostRecord> CostRecords => Set<CostRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.TenantId);
            entity.Property(e => e.Roles).HasColumnType("jsonb");
        });

        // Project
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TenantId);
            entity.Property(e => e.Status).HasConversion<string>();
        });

        // ModelVersion
        modelBuilder.Entity<ModelVersion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ProjectId);
            entity.Property(e => e.FileType).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.Stats).HasColumnType("jsonb");
        });

        // Element
        modelBuilder.Entity<Element>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.VersionId);
            entity.HasIndex(e => e.Discipline);
            entity.Property(e => e.Attributes).HasColumnType("jsonb");
        });

        // Activity
        modelBuilder.Entity<Activity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.StartPlanned);
            entity.Property(e => e.Predecessors).HasColumnType("jsonb");
        });

        // ElementActivityMapping
        modelBuilder.Entity<ElementActivityMapping>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ElementId, e.ActivityId }).IsUnique();
        });

        // ProgressRecord
        modelBuilder.Entity<ProgressRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ActivityId);
            entity.HasIndex(e => e.Timestamp);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.GeoLocation).HasColumnType("jsonb");
        });

        // CostRecord
        modelBuilder.Entity<CostRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.Date);
        });
    }
}
