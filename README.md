# Shancrys 4D Platform

**Plataforma de Construção Digital 4D**: integra modelo BIM (3D) + cronograma (tempo) para simular, planejar e controlar execução de obras.

[![Status](https://img.shields.io/badge/status-MVP%20em%20desenvolvimento-yellow)](https://github.com/your-org/shancrys)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)](https://dotnet.microsoft.com/)
[![C++](https://img.shields.io/badge/C++-20-00599C)](https://isocpp.org/)

## 🚀 Início Rápido

```powershell
# 1. Subir infraestrutura
cd infrastructure
docker-compose up -d

# 2. Executar API
cd ..\services\api
dotnet run

# 3. Acessar Swagger
start http://localhost:5000/swagger
```

📖 **[Guia Completo de Início](./QUICKSTART.md)**

## 📦 Módulos

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **4D Pro** | Importação IFC/DGN, vinculação elementos ↔ atividades, simulação temporal | 🟡 Em desenvolvimento |
| **Control** | Portal colaborativo, versionamento de modelos e documentos | 🟡 Em desenvolvimento |
| **Field** | App offline para registro de progresso, fotos, inspeções | ⚪ Planejado |
| **Perform** | Métricas de custo, produtividade e desvios | ⚪ Planejado |

## 🎯 Status MVP

- [x] Arquitetura e modelagem de dados definidas
- [x] API REST funcional (.NET 8)
- [x] Parser BIM básico (C++)
- [x] Infraestrutura local (Docker Compose)
- [ ] Autenticação JWT completa
- [ ] Upload e processamento de modelo IFC
- [ ] Interface web 3D (Three.js)
- [ ] Timeline 4D interativa
- [ ] App mobile offline-first
- [ ] Dashboard de métricas

## 🛠️ Stack Tecnológica

### Backend

- **API**: .NET 8 (C#) - REST + Entity Framework Core
- **Engine**: C++ 20 - Parsing BIM + simulação
- **Analytics**: Python (futuro) - Métricas e forecasting

### Frontend

- **Web**: React + Vite + Three.js - Visualização 3D
- **Mobile**: Flutter - App campo offline-first

### Infraestrutura

- **Database**: PostgreSQL 16 + JSONB
- **Cache**: Redis
- **Mensageria**: RabbitMQ
- **Containers**: Docker + Docker Compose

## 📁 Estrutura do Projeto

```text
Shancrys/
├── engine/              # C++ parser BIM + simulação ✅
├── services/
│   ├── api/            # .NET 8 REST API ✅
│   └── analytics/      # Python analytics (futuro)
├── web/                # React + Three.js
├── mobile/             # Flutter app
├── infrastructure/     # Docker Compose ✅
│   ├── docker-compose.yml
│   └── init-scripts/
├── docs/               # Documentação + ADRs ✅
├── specs/              # OpenAPI, modelos ✅
└── scripts/            # Utilitários
```

## 🏗️ Arquitetura

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web App   │────▶│   API REST  │────▶│  PostgreSQL │
│  (React)    │     │   (.NET 8)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ├────▶ RabbitMQ (eventos)
                           │
                           ├────▶ Redis (cache)
                           │
┌─────────────┐            │
│ Mobile App  │────────────┘
│  (Flutter)  │
└─────────────┘            │
                           ▼
                    ┌─────────────┐
                    │   Engine    │
                    │   (C++)     │
                    │  IFC Parser │
                    └─────────────┘
```

## 📚 Documentação

- **[Guia de Início Rápido](./QUICKSTART.md)** - Setup e primeiros passos
- **[Especificação API](./specs/api-openapi.yaml)** - OpenAPI 3.1
- **[Modelo de Dados](./specs/data-model.md)** - Entidades e relacionamentos
- **[Arquitetura](./docs/architecture.md)** - Visão macro e fluxos
- **[ADRs](./docs/)** - Decisões arquiteturais documentadas

## 🧪 Desenvolvimento

### Pré-requisitos

- .NET 8 SDK
- Docker Desktop
- CMake 3.20+ (para engine C++)
- Node.js 20+ (para web)
- VS Code (recomendado)

### Comandos úteis

```powershell
# API
cd services/api
dotnet run                    # Dev mode
dotnet test                   # Testes

# Engine
cd engine
cmake --build build --config Release
.\build\Release\shancrys_cli.exe parse modelo.ifc

# Infraestrutura
cd infrastructure
docker-compose up -d          # Subir
docker-compose logs -f api    # Logs
docker-compose down -v        # Reset completo
```

## 🔐 Segurança

- Multi-tenant com isolamento por `tenantId`
- JWT Bearer authentication
- RBAC: Admin, Planejador, Campo, Financeiro, Leitor
- Prepared statements (proteção SQL injection)
- CORS configurável

## 📊 Métricas de Sucesso (MVP)

| Métrica | Meta |
|---------|------|
| Tempo importação modelo (50k elementos) | < 10s |
| FPS simulação 4D (web) | ≥ 30 |
| Tempo sincronização offline | < 60s |
| Uptime API | > 99% |

## 🗺️ Roadmap

### Q4 2024

- [x] Definição arquitetura e stack
- [x] Setup infraestrutura base
- [x] API MVP funcional
- [ ] Parser IFC funcional

### Q1 2025

- [ ] Interface web 3D
- [ ] Timeline 4D básica
- [ ] Mobile app MVP
- [ ] Primeiro beta interno

### Q2 2025

- [ ] Integração Bentley SDK (DGN)
- [ ] Analytics e forecasting
- [ ] Clash detection básico
- [ ] Beta clientes selecionados

---

**Status do projeto**: 🟡 MVP em desenvolvimento ativo  
**Última atualização**: Novembro 2024
