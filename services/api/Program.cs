using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Shancrys.Api.Configuration;
using Serilog;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Configure URLs - listen on all interfaces for container environments
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with multipart/form-data support
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName); // Evita conflitos
    
    // Configurar suporte para upload de arquivos
    options.MapType<IFormFile>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "binary"
  });
    
    // Adicionar informações da API
    options.SwaggerDoc("v1", new OpenApiInfo
    {
     Title = "Shancrys API",
        Version = "v1",
        Description = "API da Plataforma 4D Shancrys para Construção Civil"
    });
    
    // Configurar autenticação JWT no Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
 {
   Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
 Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
  {
        {
       new OpenApiSecurityScheme
            {
     Reference = new OpenApiReference
        {
       Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
    }
        },
            Array.Empty<string>()
        }
    });
});

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

// Register MongoDB Context
builder.Services.AddScoped<Shancrys.Api.Data.IMongoDbContext, Shancrys.Api.Data.MongoDbContext>();

// Register Identity services
builder.Services.AddScoped<IPasswordHasher<Shancrys.Api.Models.User>, PasswordHasher<Shancrys.Api.Models.User>>();

// Register Tenant Service
builder.Services.AddScoped<Shancrys.Api.Middleware.ITenantService, Shancrys.Api.Middleware.TenantService>();

// Register application services
builder.Services.AddScoped<Shancrys.Api.Services.IAuthService, Shancrys.Api.Services.AuthService>();
builder.Services.AddScoped<Shancrys.Api.Services.IBillingService, Shancrys.Api.Services.BillingService>();
builder.Services.AddSingleton<Shancrys.Api.Services.IBlobStorageService, Shancrys.Api.Services.AzureBlobStorageService>();
builder.Services.AddScoped<Shancrys.Api.Services.IIFCParserService, Shancrys.Api.Services.IFCParserService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>() 
    ?? throw new InvalidOperationException("JWT settings not configured");

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
      ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
  {
       Log.Warning("JWT authentication failed: {Error}", context.Exception.Message);
            return Task.CompletedTask;
        },
    OnTokenValidated = context =>
        {
            Log.Debug("JWT token validated successfully");
     return Task.CompletedTask;
   }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("admin", "manager"));
});

// Configure CORS
builder.Services.AddCors(options =>
{
 options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
         .AllowAnyHeader();
    });
});

Log.Information("Building application...");
var app = builder.Build();
Log.Information("Application built successfully");

// Configure the HTTP request pipeline
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Shancrys API v1");
    });
}

app.UseAuthentication();
app.UseMiddleware<Shancrys.Api.Middleware.TenantMiddleware>();
app.UseAuthorization();

app.MapControllers();

try
{
  Log.Information("Starting Shancrys API with MongoDB");
    Console.WriteLine($"API will start on: http://0.0.0.0:{port}");
    Console.WriteLine($"Swagger UI: http://localhost:{port}/swagger");
    
    // Add global exception handler
    app.UseExceptionHandler(appBuilder =>
    {
        appBuilder.Run(async context =>
        {
 context.Response.StatusCode = 500;
    context.Response.ContentType = "application/json";
            
        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
          var exception = exceptionHandlerPathFeature?.Error;
     
    Log.Error(exception, "Unhandled exception occurred");
            Console.WriteLine($"EXCEPTION: {exception?.Message}");
            Console.WriteLine($"STACK TRACE: {exception?.StackTrace}");
       
     await context.Response.WriteAsJsonAsync(new
            {
       error = exception?.Message ?? "An error occurred",
     stackTrace = app.Environment.IsDevelopment() ? exception?.StackTrace : null
         });
    });
    });
  
    Log.Information("About to call app.Run()");
    app.Run();
    Log.Information("app.Run() completed");
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
    Console.WriteLine($"FATAL ERROR: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
