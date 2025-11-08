using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shancrys.Api.Services;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var (success, token, refreshToken, user, error) = await _authService.LoginAsync(request.Email, request.Password);

        if (!success)
        {
            return Unauthorized(new { message = error ?? "Invalid credentials" });
        }

        return Ok(new LoginResponseDto
        {
            Token = token!,
            RefreshToken = refreshToken,
            ExpiresIn = 3600,
            User = new UserDto
            {
                Id = user!.Id,
                Email = user.Email,
                Name = user.Name,
                Roles = user.Roles,
                TenantId = user.TenantId
            }
        });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        // Validação básica
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email e senha são obrigatórios" });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new { message = "Senha deve ter pelo menos 6 caracteres" });
        }

        var tenantId = request.TenantId ?? Guid.NewGuid(); // Novo tenant se não especificado
        var roles = request.Roles ?? new List<string> { "reader" };

        var (success, user, error) = await _authService.RegisterAsync(
            request.Email,
            request.Password,
            request.Name,
            tenantId,
            roles
        );

        if (!success)
        {
            return BadRequest(new { message = error ?? "Falha ao registrar usuário" });
        }

        var token = _authService.GenerateJwtToken(user!);

        _logger.LogInformation("User {UserId} registered successfully", user!.Id);

        return CreatedAtAction(nameof(Register), new RegisterResponseDto
        {
            Token = token,
            ExpiresIn = 3600,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Roles = user.Roles,
                TenantId = user.TenantId
            }
        });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new { message = "Refresh token é obrigatório" });
        }

        var (success, token, refreshToken, error) = await _authService.RefreshTokenAsync(request.RefreshToken);

        if (!success)
        {
            return Unauthorized(new { message = error ?? "Token inválido" });
        }

        var userId = ExtractUserIdFromToken(token!);
        var user = await _authService.GetUserByIdAsync(userId);

        return Ok(new LoginResponseDto
        {
            Token = token!,
            RefreshToken = refreshToken,
            ExpiresIn = 3600,
            User = new UserDto
            {
                Id = user!.Id,
                Email = user.Email,
                Name = user.Name,
                Roles = user.Roles,
                TenantId = user.TenantId
            }
        });
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<ActionResult> RevokeToken([FromBody] RefreshTokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new { message = "Refresh token é obrigatório" });
        }

        var success = await _authService.RevokeTokenAsync(request.RefreshToken);
        
        if (!success)
        {
            return NotFound(new { message = "Token não encontrado" });
        }

        return Ok(new { message = "Token revogado com sucesso" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserByIdAsync(Guid.Parse(userId));
        
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Roles = user.Roles,
            TenantId = user.TenantId
        });
    }

    private Guid ExtractUserIdFromToken(string token)
    {
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jsonToken = handler.ReadToken(token) as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;
        var userIdClaim = jsonToken?.Claims.First(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value;
        return Guid.Parse(userIdClaim!);
    }
}

// DTOs
public record LoginRequestDto(string Email, string Password);

public record RefreshTokenRequestDto(string RefreshToken);

public record LoginResponseDto
{
    public required string Token { get; init; }
    public string? RefreshToken { get; init; }
    public int ExpiresIn { get; init; }
    public required UserDto User { get; init; }
}

public record RegisterRequestDto(
    string Email,
    string Password,
    string Name,
    Guid? TenantId,
    List<string>? Roles
);

public record RegisterResponseDto
{
    public required string Token { get; init; }
    public int ExpiresIn { get; init; }
    public required UserDto User { get; init; }
}

public record UserDto
{
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
    public required List<string> Roles { get; init; }
    public required Guid TenantId { get; init; }
}
