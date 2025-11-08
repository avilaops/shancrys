using MongoDB.Driver;
using Shancrys.Api.Configuration;
using Shancrys.Api.Data;
using Shancrys.Api.Models;
using Stripe;
using Stripe.Checkout;
using Stripe.BillingPortal;
using StripeSubscription = Stripe.Subscription;
using StripeInvoice = Stripe.Invoice;
using AppSubscription = Shancrys.Api.Models.Subscription;
using AppInvoice = Shancrys.Api.Models.Invoice;
using AppInvoiceLineItem = Shancrys.Api.Models.InvoiceLineItem;

namespace Shancrys.Api.Services;

public interface IBillingService
{
    Task<List<SubscriptionPlan>> GetPlansAsync();
    Task<SubscriptionPlan?> GetPlanByIdAsync(string planId);
    Task<AppSubscription?> GetSubscriptionByTenantIdAsync(string tenantId);
    Task<AppSubscription> CreateSubscriptionAsync(string tenantId, string planId, BillingInterval interval, string? trialDays = null);
    Task<AppSubscription> CancelSubscriptionAsync(string subscriptionId, bool immediately = false);
    Task<AppSubscription> ReactivateSubscriptionAsync(string subscriptionId);
    Task<AppSubscription> ChangePlanAsync(string subscriptionId, string newPlanId);
    Task<List<AppInvoice>> GetInvoicesByTenantIdAsync(string tenantId, int limit = 10);
    Task<Stripe.Checkout.Session> CreateCheckoutSessionAsync(string tenantId, string planId, BillingInterval interval, string successUrl, string cancelUrl);
    Task<Stripe.BillingPortal.Session> CreateCustomerPortalSessionAsync(string tenantId, string returnUrl);
    Task ProcessWebhookAsync(string json, string signature);
    Task<UsageStats> GetUsageStatsAsync(string tenantId);
}

public class UsageStats
{
    public int ProjectCount { get; set; }
    public int UserCount { get; set; }
    public long StorageUsedGB { get; set; }
    public int ModelCount { get; set; }
    public PlanFeatures Limits { get; set; } = new();
}

public class BillingService : IBillingService
{
    private readonly IMongoDbContext _context;
    private readonly StripeSettings _stripeSettings;
    private readonly ILogger<BillingService> _logger;

    public BillingService(
        IMongoDbContext context,
        IConfiguration configuration,
        ILogger<BillingService> logger)
    {
        _context = context;
        _stripeSettings = configuration.GetSection("Stripe").Get<StripeSettings>()
            ?? throw new InvalidOperationException("Stripe configuration missing");
        _logger = logger;

        StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
    }

    public async Task<List<SubscriptionPlan>> GetPlansAsync()
    {
        return await _context.SubscriptionPlans
            .Find(p => p.IsActive)
            .SortBy(p => p.SortOrder)
            .ToListAsync();
    }

    public async Task<SubscriptionPlan?> GetPlanByIdAsync(string planId)
    {
        return await _context.SubscriptionPlans
            .Find(p => p.Id == planId)
            .FirstOrDefaultAsync();
    }

    public async Task<AppSubscription?> GetSubscriptionByTenantIdAsync(string tenantId)
    {
        return await _context.Subscriptions
            .Find(s => s.TenantId == tenantId && s.Status != SubscriptionStatus.Canceled)
            .FirstOrDefaultAsync();
    }

    public async Task<AppSubscription> CreateSubscriptionAsync(
        string tenantId,
        string planId,
        BillingInterval interval,
        string? trialDays = null)
    {
        var plan = await GetPlanByIdAsync(planId)
            ?? throw new InvalidOperationException($"Plan {planId} not found");

        // Criar customer no Stripe
        var customerService = new CustomerService();
        var customer = await customerService.CreateAsync(new CustomerCreateOptions
        {
            Metadata = new Dictionary<string, string>
            {
                { "tenantId", tenantId }
            }
        });

        // Criar subscription no Stripe
        var subscriptionService = new Stripe.SubscriptionService();
        var subscriptionOptions = new SubscriptionCreateOptions
        {
            Customer = customer.Id,
            Items = new List<SubscriptionItemOptions>
            {
                new SubscriptionItemOptions
                {
                    Price = interval == BillingInterval.Monthly ? plan.StripePriceId : plan.StripePriceId, // TODO: separate yearly price
                }
            },
            Metadata = new Dictionary<string, string>
            {
                { "tenantId", tenantId },
                { "planId", planId }
            }
        };

        if (!string.IsNullOrEmpty(trialDays) && int.TryParse(trialDays, out int days))
        {
            subscriptionOptions.TrialPeriodDays = days;
        }

        var stripeSubscription = await subscriptionService.CreateAsync(subscriptionOptions);

        // Salvar no banco
        var subscription = new AppSubscription {
            TenantId = tenantId,
            PlanId = planId,
            StripeSubscriptionId = stripeSubscription.Id,
            StripeCustomerId = customer.Id,
            Status = stripeSubscription.Status == "trialing" 
                ? SubscriptionStatus.Trialing 
                : SubscriptionStatus.Active,
            BillingInterval = interval,
            CurrentPeriodStart = stripeSubscription.CurrentPeriodStart,
            CurrentPeriodEnd = stripeSubscription.CurrentPeriodEnd,
            TrialEnd = stripeSubscription.TrialEnd
        };

        await _context.Subscriptions.InsertOneAsync(subscription);

        _logger.LogInformation("Subscription created for tenant {TenantId}, plan {PlanId}", tenantId, planId);

        return subscription;
    }

    public async Task<AppSubscription> CancelSubscriptionAsync(string subscriptionId, bool immediately = false)
    {
        var subscription = await _context.Subscriptions
            .Find(s => s.Id == subscriptionId)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException($"Subscription {subscriptionId} not found");

        var subscriptionService = new Stripe.SubscriptionService();

        if (immediately)
        {
            await subscriptionService.CancelAsync(subscription.StripeSubscriptionId);
            subscription.Status = SubscriptionStatus.Canceled;
            subscription.CanceledAt = DateTime.UtcNow;
        }
        else
        {
            await subscriptionService.UpdateAsync(subscription.StripeSubscriptionId, new SubscriptionUpdateOptions
            {
                CancelAtPeriodEnd = true
            });
            subscription.CancelAtPeriodEnd = true;
        }

        subscription.UpdatedAt = DateTime.UtcNow;
        await _context.Subscriptions.ReplaceOneAsync(s => s.Id == subscriptionId, subscription);

        _logger.LogInformation("Subscription {SubscriptionId} canceled (immediate: {Immediately})", subscriptionId, immediately);

        return subscription;
    }

    public async Task<AppSubscription> ReactivateSubscriptionAsync(string subscriptionId)
    {
        var subscription = await _context.Subscriptions
            .Find(s => s.Id == subscriptionId)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException($"Subscription {subscriptionId} not found");

        if (!subscription.CancelAtPeriodEnd)
        {
            throw new InvalidOperationException("Subscription is not scheduled for cancellation");
        }

        var subscriptionService = new Stripe.SubscriptionService();
        await subscriptionService.UpdateAsync(subscription.StripeSubscriptionId, new SubscriptionUpdateOptions
        {
            CancelAtPeriodEnd = false
        });

        subscription.CancelAtPeriodEnd = false;
        subscription.UpdatedAt = DateTime.UtcNow;
        await _context.Subscriptions.ReplaceOneAsync(s => s.Id == subscriptionId, subscription);

        _logger.LogInformation("Subscription {SubscriptionId} reactivated", subscriptionId);

        return subscription;
    }

    public async Task<AppSubscription> ChangePlanAsync(string subscriptionId, string newPlanId)
    {
        var subscription = await _context.Subscriptions
            .Find(s => s.Id == subscriptionId)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException($"Subscription {subscriptionId} not found");

        var newPlan = await GetPlanByIdAsync(newPlanId)
            ?? throw new InvalidOperationException($"Plan {newPlanId} not found");

        var subscriptionService = new Stripe.SubscriptionService();
        var stripeSubscription = await subscriptionService.GetAsync(subscription.StripeSubscriptionId);

        await subscriptionService.UpdateAsync(subscription.StripeSubscriptionId, new SubscriptionUpdateOptions
        {
            Items = new List<SubscriptionItemOptions>
            {
                new SubscriptionItemOptions
                {
                    Id = stripeSubscription.Items.Data[0].Id,
                    Price = newPlan.StripePriceId
                }
            },
            ProrationBehavior = "create_prorations"
        });

        subscription.PlanId = newPlanId;
        subscription.UpdatedAt = DateTime.UtcNow;
        await _context.Subscriptions.ReplaceOneAsync(s => s.Id == subscriptionId, subscription);

        _logger.LogInformation("Subscription {SubscriptionId} changed to plan {NewPlanId}", subscriptionId, newPlanId);

        return subscription;
    }

    public async Task<List<AppInvoice>> GetInvoicesByTenantIdAsync(string tenantId, int limit = 10)
    {
        return await _context.Invoices
            .Find(i => i.TenantId == tenantId)
            .SortByDescending(i => i.CreatedAt)
            .Limit(limit)
            .ToListAsync();
    }

    public async Task<Stripe.Checkout.Session> CreateCheckoutSessionAsync(
        string tenantId,
        string planId,
        BillingInterval interval,
        string successUrl,
        string cancelUrl)
    {
        var plan = await GetPlanByIdAsync(planId)
            ?? throw new InvalidOperationException($"Plan {planId} not found");

        var sessionService = new Stripe.Checkout.SessionService();
        var session = await sessionService.CreateAsync(new Stripe.Checkout.SessionCreateOptions
        {
            Mode = "subscription",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Price = plan.StripePriceId,
                    Quantity = 1
                }
            },
            Metadata = new Dictionary<string, string>
            {
                { "tenantId", tenantId },
                { "planId", planId },
                { "interval", interval.ToString() }
            }
        });

        return session;
    }

    public async Task<Stripe.BillingPortal.Session> CreateCustomerPortalSessionAsync(string tenantId, string returnUrl)
    {
        var subscription = await GetSubscriptionByTenantIdAsync(tenantId)
            ?? throw new InvalidOperationException("No active subscription found");

        var portalService = new Stripe.BillingPortal.SessionService();
        var session = await portalService.CreateAsync(new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = subscription.StripeCustomerId,
            ReturnUrl = returnUrl
        });

        return session;
    }

    public async Task ProcessWebhookAsync(string json, string signature)
    {
        var stripeEvent = EventUtility.ConstructEvent(json, signature, _stripeSettings.WebhookSecret);

        _logger.LogInformation("Processing Stripe webhook: {EventType}", stripeEvent.Type);

        switch (stripeEvent.Type)
        {
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await HandleSubscriptionUpdatedAsync(stripeEvent);
                break;

            case "customer.subscription.deleted":
                await HandleSubscriptionDeletedAsync(stripeEvent);
                break;

            case "invoice.payment_succeeded":
                await HandleInvoicePaymentSucceededAsync(stripeEvent);
                break;

            case "invoice.payment_failed":
                await HandleInvoicePaymentFailedAsync(stripeEvent);
                break;

            default:
                _logger.LogWarning("Unhandled webhook event: {EventType}", stripeEvent.Type);
                break;
        }
    }

    private async Task HandleSubscriptionUpdatedAsync(Event stripeEvent)
    {
        var stripeSubscription = stripeEvent.Data.Object as Stripe.Subscription;
        if (stripeSubscription == null) return;

        var tenantId = stripeSubscription.Metadata.GetValueOrDefault("tenantId");
        if (string.IsNullOrEmpty(tenantId)) return;

        var subscription = await GetSubscriptionByTenantIdAsync(tenantId);
        if (subscription == null) return;

        subscription.Status = stripeSubscription.Status switch
        {
            "active" => SubscriptionStatus.Active,
            "trialing" => SubscriptionStatus.Trialing,
            "past_due" => SubscriptionStatus.PastDue,
            "canceled" => SubscriptionStatus.Canceled,
            "unpaid" => SubscriptionStatus.Unpaid,
            _ => subscription.Status
        };

        subscription.CurrentPeriodStart = stripeSubscription.CurrentPeriodStart;
        subscription.CurrentPeriodEnd = stripeSubscription.CurrentPeriodEnd;
        subscription.UpdatedAt = DateTime.UtcNow;

        await _context.Subscriptions.ReplaceOneAsync(s => s.Id == subscription.Id, subscription);
    }

    private async Task HandleSubscriptionDeletedAsync(Event stripeEvent)
    {
        var stripeSubscription = stripeEvent.Data.Object as Stripe.Subscription;
        if (stripeSubscription == null) return;

        var subscription = await _context.Subscriptions
            .Find(s => s.StripeSubscriptionId == stripeSubscription.Id)
            .FirstOrDefaultAsync();

        if (subscription == null) return;

        subscription.Status = SubscriptionStatus.Canceled;
        subscription.CanceledAt = DateTime.UtcNow;
        subscription.UpdatedAt = DateTime.UtcNow;

        await _context.Subscriptions.ReplaceOneAsync(s => s.Id == subscription.Id, subscription);
    }

    private async Task HandleInvoicePaymentSucceededAsync(Event stripeEvent)
    {
        var stripeInvoice = stripeEvent.Data.Object as Stripe.Invoice;
        if (stripeInvoice == null) return;

        var subscription = await _context.Subscriptions
            .Find(s => s.StripeSubscriptionId == stripeInvoice.SubscriptionId)
            .FirstOrDefaultAsync();

        if (subscription == null) return;

        var invoice = new AppInvoice
        {
            TenantId = subscription.TenantId,
            SubscriptionId = subscription.Id,
            StripeInvoiceId = stripeInvoice.Id,
            InvoiceNumber = stripeInvoice.Number ?? "N/A",
            Subtotal = stripeInvoice.Subtotal / 100m,
            Tax = stripeInvoice.Tax.GetValueOrDefault() / 100m,
            Total = stripeInvoice.Total / 100m,
            Status = InvoiceStatus.Paid,
            PaidAt = DateTime.UtcNow,
            DueDate = stripeInvoice.DueDate.GetValueOrDefault(),
            InvoicePdfUrl = stripeInvoice.InvoicePdf,
            HostedInvoiceUrl = stripeInvoice.HostedInvoiceUrl,
            LineItems = stripeInvoice.Lines.Data.Select(line => new AppInvoiceLineItem
            {
                Description = line.Description ?? "Subscription",
                Quantity = (int)line.Quantity.GetValueOrDefault(1),
                UnitPrice = line.Price?.UnitAmount.GetValueOrDefault() / 100m ?? 0,
                Amount = line.Amount / 100m
            }).ToList()
        };

        await _context.Invoices.InsertOneAsync(invoice);
    }

    private async Task HandleInvoicePaymentFailedAsync(Event stripeEvent)
    {
        var stripeInvoice = stripeEvent.Data.Object as Stripe.Invoice;
        if (stripeInvoice == null) return;

        var subscription = await _context.Subscriptions
            .Find(s => s.StripeSubscriptionId == stripeInvoice.SubscriptionId)
            .FirstOrDefaultAsync();

        if (subscription == null) return;

        subscription.Status = SubscriptionStatus.PastDue;
        subscription.UpdatedAt = DateTime.UtcNow;

        await _context.Subscriptions.ReplaceOneAsync(s => s.Id == subscription.Id, subscription);

        _logger.LogWarning("Payment failed for subscription {SubscriptionId}", subscription.Id);
    }

    public async Task<UsageStats> GetUsageStatsAsync(string tenantId)
    {
        var subscription = await GetSubscriptionByTenantIdAsync(tenantId);
        var plan = subscription != null ? await GetPlanByIdAsync(subscription.PlanId) : null;

        var projectCount = await _context.Projects
            .CountDocumentsAsync(p => p.TenantId == Guid.Parse(tenantId));

        var userCount = await _context.Users
            .CountDocumentsAsync(u => u.TenantId == Guid.Parse(tenantId));

        var modelCount = await _context.ModelVersions
            .CountDocumentsAsync(m => m.ProjectId.ToString() == tenantId); // TODO: fix tenant filtering

        return new UsageStats
        {
            ProjectCount = (int)projectCount,
            UserCount = (int)userCount,
            ModelCount = (int)modelCount,
            StorageUsedGB = 0, // TODO: calculate from file storage
            Limits = plan?.Features ?? new PlanFeatures()
        };
    }
}

