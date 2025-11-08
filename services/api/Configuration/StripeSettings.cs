namespace Shancrys.Api.Configuration;

public class StripeSettings
{
    public required string SecretKey { get; set; }
    public required string PublishableKey { get; set; }
    public required string WebhookSecret { get; set; }
    public string Currency { get; set; } = "brl";
    public bool EnableTestMode { get; set; } = true;
}
