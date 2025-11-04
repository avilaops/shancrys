# 🏗️ Shancrys - Plataforma 4D BIM para Engenharia Civil

Plataforma completa de construção digital que combina modelos BIM 3D com cronogramas de obra (4D) para simulação, controle e análise de projetos de engenharia civil.

## 🚀 Início Rápido

### Executar Shancrys Completo

```powershell
# Windows
.\start-shancrys.ps1
```

Isso iniciará automaticamente:

- ✅ API Backend (.NET 8) - `http://localhost:5000`
- ✅ DevTools (Observabilidade) - `http://localhost:5173`

### Parar Tudo

```powershell
.\stop-shancrys.ps1
```

## 📦 Arquitetura

```
shancrys/
├── services/
│   └── api/              # Backend .NET 8 + Entity Framework
│       ├── Controllers/  # REST API endpoints
│       ├── Models/       # Entidades do domínio
│       ├── Data/         # DbContext e migrations
│       └── Middleware/   # Multi-tenant, auth
├── devtools/             # Dashboard de observabilidade
│   └── src/
│       ├── components/   # Logs, métricas, API monitor
│       └── App.tsx       # Interface React
├── engine/               # Parser BIM C++ (em desenvolvimento)
└── specs/                # OpenAPI, ADRs, documentação
```

## 🎯 Funcionalidades Implementadas

### ✅ Backend API

- **Autenticação JWT** com registro e login
- **Multi-tenant** via middleware
- **CRUD completo:**
  - Projetos
  - Modelos BIM (upload IFC/RVT)
  - Elementos 3D
  - Atividades (cronograma)
  - Mapeamentos 4D (elemento ↔ atividade)
  - Progresso de obra
  - Custos
- **Banco in-memory** (sem necessidade de PostgreSQL local)
- **Swagger UI** para testes

### ✅ DevTools (Observabilidade)

- **Logs em tempo real** com filtros por nível
- **Métricas de performance** (CPU, memória, latência)
- **Monitor de API** (requests, status codes)
- **Monitor de Database** (queries executadas)
- **Event Stream** (eventos do sistema)

## 🔧 Tecnologias

### Backend

- .NET 8.0
- Entity Framework Core 8
- PostgreSQL / InMemory
- JWT Authentication
- Serilog
- Swagger/OpenAPI

### DevTools

- React 18 + TypeScript
- Vite
- TailwindCSS
- Recharts (gráficos)
- Lucide Icons

### Engine (planejado)

- C++ 20
- CMake
- ifcopenshell (parser IFC)

## 📊 Endpoints Principais

### Autenticação

```
POST /api/v1/auth/register  # Registrar usuário
POST /api/v1/auth/login     # Login
GET  /api/v1/auth/me        # Dados do usuário
```

### Projetos

```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{id}
PUT    /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
```

### Modelos BIM

```
GET    /api/v1/models
POST   /api/v1/models           # Upload IFC/RVT
GET    /api/v1/models/{id}
POST   /api/v1/models/{id}/process
DELETE /api/v1/models/{id}
```

### Elementos 3D

```
GET  /api/v1/elements
GET  /api/v1/elements/{id}
POST /api/v1/elements/bulk      # Criar múltiplos
GET  /api/v1/elements/disciplines
GET  /api/v1/elements/types
```

### Atividades

```
GET    /api/v1/activities
POST   /api/v1/activities
GET    /api/v1/activities/{id}
PUT    /api/v1/activities/{id}
DELETE /api/v1/activities/{id}
POST   /api/v1/activities/bulk  # Importar cronograma
```

### Mapeamentos 4D

```
GET  /api/v1/mappings
POST /api/v1/mappings           # Vincular elemento + atividade
POST /api/v1/mappings/bulk
POST /api/v1/mappings/auto-map  # Mapeamento automático
DELETE /api/v1/mappings/{id}
```

## 🧪 Testando a API

1. **Abra o Swagger:** `http://localhost:5000/swagger`

2. **Registre um usuário:**

```json
POST /api/v1/auth/register
{
  "email": "admin@shancrys.com",
  "password": "senha123",
  "name": "Administrador",
  "tenantId": null,
  "roles": ["admin", "manager"]
}
```

3. **Copie o token** da resposta

4. **Autentique no Swagger:**
   - Clique em "Authorize"
   - Cole o token
   - Agora pode testar endpoints protegidos!

5. **Crie um projeto:**

```json
POST /api/v1/projects
{
  "name": "Edifício Central",
  "location": "São Paulo, SP",
  "description": "Construção de edifício comercial",
  "startDate": "2025-01-15T00:00:00Z",
  "endDate": "2025-12-31T00:00:00Z"
}
```

## 🔍 Monitoramento com DevTools

Acesse: `http://localhost:5173`

**5 Painéis disponíveis:**

1. **Logs** - Stream em tempo real
2. **Métricas** - CPU, memória, requests/s
3. **Database** - Queries executadas
4. **API Monitor** - HTTP requests
5. **Eventos** - Event stream do sistema

## 🚧 Roadmap

Ver `ROADMAP-PERFORMANCE.md` para lista completa.

### Próximas Implementações

- [ ] SimulationController (motor 4D)
- [ ] Frontend React com Three.js (viewer 3D)
- [ ] Parser IFC real (ifcopenshell)
- [ ] Background jobs (Hangfire)
- [ ] Cache Redis
- [ ] Mobile app (Flutter)

## 📁 Estrutura de Dados

### Principais Entidades

- **User** - Usuários com roles e multi-tenant
- **Project** - Projetos de construção
- **ModelVersion** - Versões de modelos BIM
- **Element** - Elementos 3D (vigas, pilares, paredes)
- **Activity** - Atividades do cronograma (WBS)
- **ElementActivityMapping** - Vínculo 3D ↔ Tempo (4D)
- **ProgressRecord** - Registros de progresso físico
- **CostRecord** - Registros de custos

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Documentação

- `ADRs/` - Architecture Decision Records
- `specs/api-openapi.yaml` - Especificação OpenAPI completa
- `ROADMAP-PERFORMANCE.md` - Melhorias planejadas
- `STATUS.md` - Status atual do projeto

## 🐛 Troubleshooting

### Porta já em uso

```powershell
.\stop-shancrys.ps1  # Para todos os serviços
.\start-shancrys.ps1  # Reinicia
```

### Erro ao conectar API

- Verifique se a porta 5000 está livre
- API usa banco in-memory por padrão
- Logs aparecem na janela PowerShell da API

### DevTools não carrega

- Verifique se Node.js está instalado
- Execute: `cd devtools; npm install`
- Porta padrão: 5173

## 📞 Suporte

Problemas? Abra uma issue!

---

**Shancrys** - Construindo o futuro digital da engenharia civil 🏗️
