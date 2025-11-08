using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Shancrys.Api.Data;
using Shancrys.Api.Models;

namespace Shancrys.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MateriaisController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly ILogger<MateriaisController> _logger;

    public MateriaisController(MongoDbContext context, ILogger<MateriaisController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/materiais
    [HttpGet]
    public async Task<ActionResult<List<Material>>> GetAll(
        [FromQuery] string? categoria = null,
        [FromQuery] string? busca = null,
        [FromQuery] bool apenasAtivos = true)
    {
        try
        {
            var tenantId = Guid.Parse(User.FindFirst("tenantId")?.Value ?? throw new UnauthorizedAccessException());

            var filter = Builders<Material>.Filter.Eq(m => m.TenantId, tenantId);

            if (apenasAtivos)
            {
                filter &= Builders<Material>.Filter.Eq(m => m.Ativo, true);
            }

            if (!string.IsNullOrEmpty(categoria) && Enum.TryParse<MaterialCategoria>(categoria, true, out var cat))
            {
                filter &= Builders<Material>.Filter.Eq(m => m.Categoria, cat);
            }

            if (!string.IsNullOrEmpty(busca))
            {
                var searchFilter = Builders<Material>.Filter.Or(
                    Builders<Material>.Filter.Regex(m => m.Nome, new MongoDB.Bson.BsonRegularExpression(busca, "i")),
                    Builders<Material>.Filter.Regex(m => m.Codigo, new MongoDB.Bson.BsonRegularExpression(busca, "i")),
                    Builders<Material>.Filter.Regex(m => m.Descricao, new MongoDB.Bson.BsonRegularExpression(busca, "i"))
                );
                filter &= searchFilter;
            }

            var materiais = await _context.Materiais
                .Find(filter)
                .SortBy(m => m.Categoria)
                .ThenBy(m => m.Nome)
                .ToListAsync();

            return Ok(materiais);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar materiais");
            return StatusCode(500, new { message = "Erro ao buscar materiais", error = ex.Message });
        }
    }

    // GET: api/materiais/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Material>> GetById(Guid id)
    {
        try
        {
            var tenantId = Guid.Parse(User.FindFirst("tenantId")?.Value ?? throw new UnauthorizedAccessException());

            var material = await _context.Materiais
                .Find(m => m.Id == id && m.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (material == null)
                return NotFound(new { message = "Material não encontrado" });

            return Ok(material);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar material {Id}", id);
            return StatusCode(500, new { message = "Erro ao buscar material", error = ex.Message });
        }
    }

    // GET: api/materiais/codigo/{codigo}
    [HttpGet("codigo/{codigo}")]
    public async Task<ActionResult<Material>> GetByCodigo(string codigo)
    {
        try
        {
            var tenantId = Guid.Parse(User.FindFirst("tenantId")?.Value ?? throw new UnauthorizedAccessException());

            var material = await _context.Materiais
                .Find(m => m.Codigo == codigo && m.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (material == null)
                return NotFound(new { message = "Material não encontrado" });

            return Ok(material);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar material por código {Codigo}", codigo);
            return StatusCode(500, new { message = "Erro ao buscar material", error = ex.Message });
        }
    }

    // GET: api/materiais/categorias
    [HttpGet("categorias")]
    public ActionResult<object> GetCategorias()
    {
        var categorias = Enum.GetValues<MaterialCategoria>()
            .Select(c => new
            {
                valor = c.ToString(),
                nome = c.ToString()
            })
            .ToList();

        return Ok(categorias);
    }

    // POST: api/materiais
    [HttpPost]
    public async Task<ActionResult<Material>> Create([FromBody] CreateMaterialDto dto)
    {
        try
        {
            var tenantId = Guid.Parse(User.FindFirst("tenantId")?.Value ?? throw new UnauthorizedAccessException());
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());

            // Verificar se já existe material com este código
            var existente = await _context.Materiais
                .Find(m => m.Codigo == dto.Codigo && m.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (existente != null)
                return BadRequest(new { message = "Já existe um material com este código" });

            var material = new Material
            {
                TenantId = tenantId,
                Codigo = dto.Codigo,
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                Categoria = dto.Categoria,
                Unidade = dto.Unidade,
                Especificacoes = dto.Especificacoes ?? new MaterialEspecificacoes(),
                PrecoUnitario = dto.PrecoUnitario,
                Moeda = dto.Moeda ?? "BRL",
                DataReferencia = dto.DataReferencia ?? DateTime.UtcNow,
                Regiao = dto.Regiao,
                FontePreco = dto.FontePreco,
                Fornecedores = dto.Fornecedores ?? new List<Fornecedor>(),
                AlternativasEquivalentes = dto.AlternativasEquivalentes ?? new List<Guid>(),
                PegadaCO2 = dto.PegadaCO2,
                Reciclavel = dto.Reciclavel,
                CertificacoesAmbientais = dto.CertificacoesAmbientais,
                Disponibilidade = dto.Disponibilidade,
                PrazoEntregaDias = dto.PrazoEntregaDias,
                CriadoPor = userId
            };

            await _context.Materiais.InsertOneAsync(material);

            return CreatedAtAction(nameof(GetById), new { id = material.Id }, material);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar material");
            return StatusCode(500, new { message = "Erro ao criar material", error = ex.Message });
        }
    }

    // PUT: api/materiais/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<Material>> Update(Guid id, [FromBody] UpdateMaterialDto dto)
    {
        try
        {
            var tenantId = Guid.Parse(User.FindFirst("tenantId")?.Value ?? throw new UnauthorizedAccessException());

            var material = await _context.Materiais
                .Find(m => m.Id == id && m.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (material == null)
                return NotFound(new { message = "Material não encontrado" });

            // Atualizar campos
            if (!string.IsNullOrEmpty(dto.Nome))
                material.Nome = dto.Nome;

            material.Descricao = dto.Descricao;

            if (dto.Categoria.HasValue)
                material.Categoria = dto.Categoria.Value;

            if (!string.IsNullOrEmpty(dto.Unidade))
                material.Unidade = dto.Unidade;

            if (dto.Especificacoes != null)
                material.Especificacoes = dto.Especificacoes;

            if (dto.PrecoUnitario.HasValue)
                material.PrecoUnitario = dto.PrecoUnitario.Value;

            if (dto.DataReferencia.HasValue)
                material.DataReferencia = dto.DataReferencia.Value;

            material.Regiao = dto.Regiao;
            material.FontePreco = dto.FontePreco;

            if (dto.Fornecedores != null)
                material.Fornecedores = dto.Fornecedores;

            if (dto.AlternativasEquivalentes != null)
                material.AlternativasEquivalentes = dto.AlternativasEquivalentes;

            material.PegadaCO2 = dto.PegadaCO2;

            if (dto.Reciclavel.HasValue)
                material.Reciclavel = dto.Reciclavel.Value;

            material.CertificacoesAmbientais = dto.CertificacoesAmbientais;

            if (dto.Disponibilidade.HasValue)
                material.Disponibilidade = dto.Disponibilidade.Value;

            if (dto.PrazoEntregaDias.HasValue)
                material.PrazoEntregaDias = dto.PrazoEntregaDias.Value;

            material.AtualizadoEm = DateTime.UtcNow;

            await _context.Materiais.ReplaceOneAsync(m => m.Id == id, material);

            return Ok(material);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar material {Id}", id);
            return StatusCode(500, new { message = "Erro ao atualizar material", error = ex.Message });
        }
    }

    // DELETE: api/materiais/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id, [FromQuery] bool permanente = false)
    {
        try
        {
            var tenantId = Guid.Parse(User.FindFirst("tenantId")?.Value ?? throw new UnauthorizedAccessException());

            var material = await _context.Materiais
                .Find(m => m.Id == id && m.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (material == null)
                return NotFound(new { message = "Material não encontrado" });

            if (permanente)
            {
                await _context.Materiais.DeleteOneAsync(m => m.Id == id);
            }
            else
            {
                // Soft delete
                material.Ativo = false;
                material.AtualizadoEm = DateTime.UtcNow;
                await _context.Materiais.ReplaceOneAsync(m => m.Id == id, material);
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar material {Id}", id);
            return StatusCode(500, new { message = "Erro ao deletar material", error = ex.Message });
        }
    }

    // GET: api/materiais/{id}/alternativas
    [HttpGet("{id}/alternativas")]
    public async Task<ActionResult<List<Material>>> GetAlternativas(Guid id)
    {
        try
        {
            var tenantId = Guid.Parse(User.FindFirst("tenantId")?.Value ?? throw new UnauthorizedAccessException());

            var material = await _context.Materiais
                .Find(m => m.Id == id && m.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (material == null)
                return NotFound(new { message = "Material não encontrado" });

            if (material.AlternativasEquivalentes.Count == 0)
                return Ok(new List<Material>());

            var alternativas = await _context.Materiais
                .Find(m => material.AlternativasEquivalentes.Contains(m.Id) && m.TenantId == tenantId)
                .ToListAsync();

            return Ok(alternativas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar alternativas do material {Id}", id);
            return StatusCode(500, new { message = "Erro ao buscar alternativas", error = ex.Message });
        }
    }

    // GET: api/materiais/comparar
    [HttpPost("comparar")]
    public async Task<ActionResult<object>> Comparar([FromBody] List<Guid> materiaisIds)
    {
        try
        {
            var tenantId = Guid.Parse(User.FindFirst("tenantId")?.Value ?? throw new UnauthorizedAccessException());

            var materiais = await _context.Materiais
                .Find(m => materiaisIds.Contains(m.Id) && m.TenantId == tenantId)
                .ToListAsync();

            if (materiais.Count == 0)
                return NotFound(new { message = "Nenhum material encontrado" });

            var comparacao = materiais.Select(m => new
            {
                m.Id,
                m.Codigo,
                m.Nome,
                m.PrecoUnitario,
                m.Unidade,
                m.PrazoEntregaDias,
                m.Disponibilidade,
                m.PegadaCO2,
                m.Reciclavel,
                Fornecedores = m.Fornecedores.Count,
                Especificacoes = m.Especificacoes
            }).ToList();

            return Ok(new
            {
                materiais = comparacao,
                analise = new
                {
                    maisBarato = comparacao.OrderBy(m => m.PrecoUnitario).First(),
                    maisRapido = comparacao.OrderBy(m => m.PrazoEntregaDias).First(),
                    maisSustentavel = comparacao.OrderBy(m => m.PegadaCO2 ?? double.MaxValue).First()
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao comparar materiais");
            return StatusCode(500, new { message = "Erro ao comparar materiais", error = ex.Message });
        }
    }
}

// DTOs
public class CreateMaterialDto
{
    public required string Codigo { get; set; }
    public required string Nome { get; set; }
    public string? Descricao { get; set; }
    public MaterialCategoria Categoria { get; set; }
    public required string Unidade { get; set; }
    public MaterialEspecificacoes? Especificacoes { get; set; }
    public decimal PrecoUnitario { get; set; }
    public string? Moeda { get; set; }
    public DateTime? DataReferencia { get; set; }
    public string? Regiao { get; set; }
    public string? FontePreco { get; set; }
    public List<Fornecedor>? Fornecedores { get; set; }
    public List<Guid>? AlternativasEquivalentes { get; set; }
    public double? PegadaCO2 { get; set; }
    public bool Reciclavel { get; set; }
    public string? CertificacoesAmbientais { get; set; }
    public DisponibilidadeMaterial Disponibilidade { get; set; }
    public int PrazoEntregaDias { get; set; }
}

public class UpdateMaterialDto
{
    public string? Nome { get; set; }
    public string? Descricao { get; set; }
    public MaterialCategoria? Categoria { get; set; }
    public string? Unidade { get; set; }
    public MaterialEspecificacoes? Especificacoes { get; set; }
    public decimal? PrecoUnitario { get; set; }
    public DateTime? DataReferencia { get; set; }
    public string? Regiao { get; set; }
    public string? FontePreco { get; set; }
    public List<Fornecedor>? Fornecedores { get; set; }
    public List<Guid>? AlternativasEquivalentes { get; set; }
    public double? PegadaCO2 { get; set; }
    public bool? Reciclavel { get; set; }
    public string? CertificacoesAmbientais { get; set; }
    public DisponibilidadeMaterial? Disponibilidade { get; set; }
    public int? PrazoEntregaDias { get; set; }
}
