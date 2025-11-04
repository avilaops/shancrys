# Shancrys API (.NET 8)

Backend REST para plataforma Shancrys 4D.

## Stack

- .NET 8 (C#)
- MongoDB (Database)
- JWT Authentication
- RabbitMQ (eventos)
- Serilog (logs estruturados)

## Setup Local

### Pré-requisitos

- .NET 8 SDK
- PostgreSQL 16+
- RabbitMQ (Docker ou local)

### Configuração

1. Atualizar connection string em `appsettings.json`
2. Gerar secret key JWT (mínimo 32 caracteres)
3. Aplicar migrations:

```powershell
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Executar

```powershell
dotnet run
```

API disponível em: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

## Estrutura

```
Controllers/   → Endpoints REST
Models/        → Entidades de domínio
Data/          → DbContext, migrations
Middleware/    → Multi-tenant, logging
Services/      → Lógica de negócio
```

## Endpoints Principais

- `POST /api/v1/auth/login` - Autenticação
- `GET /api/v1/projects` - Listar projetos
- `POST /api/v1/projects` - Criar projeto
- `POST /api/v1/projects/{id}/models` - Upload modelo BIM
- `GET /api/v1/projects/{id}/simulation` - Estado simulação 4D

Ver especificação completa em `/specs/api-openapi.yaml`

## Multi-Tenancy

Cada requisição extrai `tenantId` do JWT. Queries filtram automaticamente por tenant.

## Observabilidade

Logs estruturados JSON (Serilog) com correlationId e tenantId.

## Próximos Passos

- [ ] Implementar AuthController (login, JWT generation)
- [ ] Controllers para Models, Activities, Simulation
- [ ] Integração RabbitMQ (publicar eventos)
- [ ] Testes unitários + integração
