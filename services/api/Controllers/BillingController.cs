using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shancrys.Api.Models;
using Shancrys.Api.Services;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;
    private readonly ILogger<BillingController> _logger;

    public BillingController(IBillingService billingService, ILogger<BillingController> logger)
    {
        _billingService = billingService;
        _logger = logger;
    }

    /// <summary>
    /// Get all available subscription plans
    /// </summary>
    [HttpGet("plans")]
    [ProducesResponseType(typeof(List<SubscriptionPlan>), 200)]
    public async Task<ActionResult<List<SubscriptionPlan>>> GetPlans()
    {
        var plans = await _billingService.GetPlansAsync();
        return Ok(plans);
    }

    /// <summary>
    /// Get plan by ID
    /// </summary>
    [HttpGet("plans/{planId}")]
    [ProducesResponseType(typeof(SubscriptionPlan), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SubscriptionPlan>> GetPlan(string planId)
    {
        var plan = await _billingService.GetPlanByIdAsync(planId);
        if (plan == null)
            return NotFound();

        return Ok(plan);
    }

    /// <summary>
    /// Get current subscription for tenant
    /// </summary>
    [HttpGet("subscription")]
    [Authorize]
    [ProducesResponseType(typeof(Subscription), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<Subscription>> GetSubscription()
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        var subscription = await _billingService.GetSubscriptionByTenantIdAsync(tenantId);
        if (subscription == null)
            return NotFound();

        return Ok(subscription);
    }

    /// <summary>
    /// Create new subscription
    /// </summary>
    [HttpPost("subscription")]
    [Authorize]
    [ProducesResponseType(typeof(Subscription), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<Subscription>> CreateSubscription([FromBody] CreateSubscriptionRequest request)
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        try
        {
            var subscription = await _billingService.CreateSubscriptionAsync(
                tenantId,
                request.PlanId,
                request.Interval,
                request.TrialDays);

            return CreatedAtAction(nameof(GetSubscription), new { }, subscription);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subscription");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Cancel subscription
    /// </summary>
    [HttpPost("subscription/cancel")]
    [Authorize]
    [ProducesResponseType(typeof(Subscription), 200)]
    public async Task<ActionResult<Subscription>> CancelSubscription([FromBody] CancelSubscriptionRequest request)
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        var subscription = await _billingService.GetSubscriptionByTenantIdAsync(tenantId);
        if (subscription == null)
            return NotFound();

        try
        {
            var updated = await _billingService.CancelSubscriptionAsync(subscription.Id, request.Immediately);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error canceling subscription");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Reactivate canceled subscription
    /// </summary>
    [HttpPost("subscription/reactivate")]
    [Authorize]
    [ProducesResponseType(typeof(Subscription), 200)]
    public async Task<ActionResult<Subscription>> ReactivateSubscription()
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        var subscription = await _billingService.GetSubscriptionByTenantIdAsync(tenantId);
        if (subscription == null)
            return NotFound();

        try
        {
            var updated = await _billingService.ReactivateSubscriptionAsync(subscription.Id);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reactivating subscription");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Change subscription plan
    /// </summary>
    [HttpPost("subscription/change-plan")]
    [Authorize]
    [ProducesResponseType(typeof(Subscription), 200)]
    public async Task<ActionResult<Subscription>> ChangePlan([FromBody] ChangePlanRequest request)
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        var subscription = await _billingService.GetSubscriptionByTenantIdAsync(tenantId);
        if (subscription == null)
            return NotFound();

        try
        {
            var updated = await _billingService.ChangePlanAsync(subscription.Id, request.NewPlanId);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing plan");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get invoices for current tenant
    /// </summary>
    [HttpGet("invoices")]
    [Authorize]
    [ProducesResponseType(typeof(List<Invoice>), 200)]
    public async Task<ActionResult<List<Invoice>>> GetInvoices([FromQuery] int limit = 10)
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        var invoices = await _billingService.GetInvoicesByTenantIdAsync(tenantId, limit);
        return Ok(invoices);
    }

    /// <summary>
    /// Create Stripe Checkout session
    /// </summary>
    [HttpPost("checkout")]
    [Authorize]
    [ProducesResponseType(typeof(CheckoutResponse), 200)]
    public async Task<ActionResult<CheckoutResponse>> CreateCheckoutSession([FromBody] CheckoutRequest request)
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        try
        {
            var session = await _billingService.CreateCheckoutSessionAsync(
                tenantId,
                request.PlanId,
                request.Interval,
                request.SuccessUrl,
                request.CancelUrl);

            return Ok(new CheckoutResponse(session.Id, session.Url));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout session");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Create Stripe Customer Portal session
    /// </summary>
    [HttpPost("portal")]
    [Authorize]
    [ProducesResponseType(typeof(PortalResponse), 200)]
    public async Task<ActionResult<PortalResponse>> CreatePortalSession([FromBody] PortalRequest request)
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        try
        {
            var session = await _billingService.CreateCustomerPortalSessionAsync(tenantId, request.ReturnUrl);
            return Ok(new PortalResponse(session.Url));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating portal session");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get usage statistics for current tenant
    /// </summary>
    [HttpGet("usage")]
    [Authorize]
    [ProducesResponseType(typeof(UsageStats), 200)]
    public async Task<ActionResult<UsageStats>> GetUsage()
    {
        var tenantId = User.FindFirst("tenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized();

        var stats = await _billingService.GetUsageStatsAsync(tenantId);
        return Ok(stats);
    }

    /// <summary>
    /// Stripe webhook endpoint
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();

        try
        {
            await _billingService.ProcessWebhookAsync(json, signature);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return BadRequest();
        }
    }
}

// DTOs
public record CreateSubscriptionRequest(string PlanId, BillingInterval Interval, string? TrialDays = null);
public record CancelSubscriptionRequest(bool Immediately = false);
public record ChangePlanRequest(string NewPlanId);
public record CheckoutRequest(string PlanId, BillingInterval Interval, string SuccessUrl, string CancelUrl);
public record CheckoutResponse(string SessionId, string Url);
public record PortalRequest(string ReturnUrl);
public record PortalResponse(string Url);
