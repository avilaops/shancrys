# 🎉 API Shancrys RODANDO

## Status: ✅ EXECUTANDO

A API está rodando em modo **desenvolvimento** com banco de dados **in-memory** (sem necessidade de PostgreSQL).

### URLs Disponíveis

- **Swagger UI**: <http://localhost:5000/swagger>
- **API Base**: <http://localhost:5000/api/v1>

### Como Testar

#### 1. Abrir Swagger

```
http://localhost:5000/swagger
```

#### 2. Registrar um Usuário (Obter Token JWT)

**Endpoint**: `POST /api/v1/auth/register`

**Body JSON**:

```json
{
  "email": "admin@shancrys.com",
  "password": "senha123",
  "name": "Administrador",
  "tenantId": null,
  "roles": ["admin", "manager"]
}
```

**Resposta** (copie o `token`):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "...",
    "email": "admin@shancrys.com",
    "name": "Administrador",
    "roles": ["admin", "manager"],
    "tenantId": "..."
  }
}
```

#### 3. Autenticar no Swagger

1. Clique no botão **"Authorize"** (cadeado verde) no topo do Swagger
2. Cole o token no campo: `Bearer <seu-token-aqui>`
3. Clique em **"Authorize"**
4. Agora você pode testar os endpoints protegidos!

#### 4. Testar Endpoint Protegido

**Endpoint**: `GET /api/v1/auth/me`

- Deve retornar seus dados de usuário
- Se não autenticado, retorna `401 Unauthorized`

#### 5. Criar um Projeto

**Endpoint**: `POST /api/v1/projects`

**Body JSON**:

```json
{
  "name": "Construção Edifício Central",
  "description": "Projeto de construção de edifício comercial",
  "startDate": "2025-01-15T00:00:00Z",
  "endDate": "2025-12-31T00:00:00Z"
}
```

#### 6. Listar Projetos

**Endpoint**: `GET /api/v1/projects?page=1&pageSize=10`

### Login com Usuário Mock

Se preferir usar login em vez de registro:

**Endpoint**: `POST /api/v1/auth/login`

**Body JSON**:

```json
{
  "email": "qualquer@email.com",
  "password": "demo123"
}
```

**Nota**: O login mock aceita **qualquer email** com senha `demo123`.

### Observações Importantes

⚠️ **Banco In-Memory**:

- Dados são **voláteis** (perdem ao reiniciar)
- Usuários registrados **não persistem**
- Ideal para testes rápidos

✅ **Funcionalidades Ativas**:

- ✅ Autenticação JWT completa
- ✅ Registro de usuários
- ✅ Login mock
- ✅ Multi-tenant (via JWT claims)
- ✅ CRUD de projetos
- ✅ Swagger OpenAPI

🔜 **Próximos Passos**:

1. Testar todos os endpoints no Swagger
2. Configurar PostgreSQL para persistência
3. Implementar controllers restantes (Models, Activities, Elements)
4. Criar frontend React

### Comandos Úteis

**Parar a API**:

```powershell
# Pressione Ctrl+C no terminal
```

**Ver logs em tempo real**:

- Os logs aparecem no terminal onde rodou `dotnet run`

**Reiniciar a API**:

```powershell
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api"
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

---

## Sucesso! 🚀

Agora você tem uma API 4D BIM totalmente funcional rodando localmente!
