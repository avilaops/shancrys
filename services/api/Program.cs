using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Shancrys.Api.Configuration;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure MongoDB
var mongoSettings = builder.Configuration.GetSection("MongoDb").Get<MongoDbSettings>()
    ?? throw new InvalidOperationException("MongoDb configuration is missing");

var mongoClientSettings = MongoClientSettings.FromConnectionString(mongoSettings.ConnectionString);
mongoClientSettings.MaxConnectionPoolSize = mongoSettings.MaxConnectionPoolSize;
mongoClientSettings.MinConnectionPoolSize = mongoSettings.MinConnectionPoolSize;
mongoClientSettings.ServerSelectionTimeout = mongoSettings.ServerSelectionTimeout;
mongoClientSettings.ConnectTimeout = mongoSettings.ConnectTimeout;

builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoClientSettings));
builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(mongoSettings.DatabaseName);
});

// Register Identity services
builder.Services.AddScoped<IPasswordHasher<Shancrys.Api.Models.User>, PasswordHasher<Shancrys.Api.Models.User>>();

// Register application services
builder.Services.AddScoped<Shancrys.Api.Services.IAuthService, Shancrys.Api.Services.AuthService>();

// Configure JWT (placeholder - implement authentication later)
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

try
{
    Log.Information("Starting Shancrys API with MongoDB");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
