namespace Shancrys.Api.Middleware;

public interface ITenantService
{
    Guid? GetCurrentTenantId();
    void SetTenantId(Guid tenantId);
}

public class TenantService : ITenantService
{
    private Guid? _tenantId;

    public Guid? GetCurrentTenantId() => _tenantId;

    public void SetTenantId(Guid tenantId) => _tenantId = tenantId;
}

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        // Extract tenantId from JWT claims
        var tenantClaim = context.User?.Claims.FirstOrDefault(c => c.Type == "tenantId");
        
        if (tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var tenantId))
        {
            tenantService.SetTenantId(tenantId);
        }

        await _next(context);
    }
}
