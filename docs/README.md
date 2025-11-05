# Documentação Shancrys 4D

Índice completo da documentação técnica e arquitetural.

## 📖 Início

- **[README Principal](../README.md)** - Visão geral do projeto
- **[Guia de Início Rápido](../QUICKSTART.md)** - Setup e primeiros passos
- **[Sumário Executivo](../SUMMARY.md)** - Status atual e realizações

## 🏗️ Arquitetura

- **[Arquitetura Macro](./architecture.md)** - Visão em camadas, fluxos e componentes
- **[Modelo de Dados](../specs/data-model.md)** - Entidades e relacionamentos
- **[Especificação API](../specs/api-openapi.yaml)** - OpenAPI 3.1 completo
- **[Escopo MVP](../specs/mvp.md)** - Funcionalidades e critérios de sucesso

## 📈 Estratégia de Marketing

- **[Estratégia Completa](./marketing-strategy.md)** - Análise de mercado, personas, canais, precificação, go-to-market
- **[Resumo Executivo](./marketing-summary.md)** - Síntese da estratégia de marketing e metas 2025

## 📋 ADRs (Architecture Decision Records)

Decisões arquiteturais documentadas em ordem cronológica:

1. **[ADR-001: Stack Tecnológica](./adr-001-stack.md)**
   - Escolha de C++, .NET 8, React, Flutter
   - Justificativas e alternativas consideradas

2. **[ADR-002: Barramento de Eventos](./adr-002-event-bus.md)**
   - Uso de RabbitMQ no MVP
   - Tópicos e formato de mensagens

3. **[ADR-003: Sincronização Offline](./adr-003-offline-sync.md)**
   - Estratégia do app Field
   - Fila local e resolução de conflitos

4. **[ADR-004: Versionamento de Modelos](./adr-004-versionamento-modelo.md)**
   - Armazenamento completo + diff metadados
   - Estratégia de storage

5. **[ADR-005: Simulação 4D](./adr-005-simulacao-4d.md)**
   - Algoritmo de playback temporal
   - Estados visuais e performance

6. **[ADR-006: Segurança e RBAC](./adr-006-seguranca-rbac.md)**
   - Multi-tenant via JWT
   - Papéis e permissões

7. **[ADR-007: Observabilidade](./adr-007-observabilidade.md)**
   - OpenTelemetry, Prometheus, logs estruturados
   - Métricas-chave

## 🔧 Guias Técnicos por Módulo

### Backend API (.NET)

- **[README API](../services/api/README.md)**
- Tecnologias: .NET 8, EF Core, PostgreSQL
- Estrutura: Controllers, Models, Data, Middleware

### Engine C++

- **[README Engine](../engine/README.md)**
- Tecnologias: C++ 20, CMake, ifcopenshell
- Funcionalidades: Parsing BIM, normalização, export JSON

### Infraestrutura

- **[README Infrastructure](../infrastructure/README.md)**
- Docker Compose: PostgreSQL, RabbitMQ, Redis
- Scripts de inicialização

## 🎯 Funcionalidades MVP

### 4D Pro

- Importar IFC/DGN
- Vincular elementos a atividades
- Simular timeline 4D

### Control

- Upload e versionamento de modelos
- Gestão básica de documentos

### Field

- Registro de progresso (percentual)
- Captura de fotos georreferenciadas
- Sincronização offline

### Perform

- Curva S (progresso planejado vs realizado)
- Top 5 atrasos
- Custo acumulado

## 🧪 Testes

_A ser implementado_

- Unit tests (xUnit)
- Integration tests (Testcontainers)
- E2E tests (Playwright)

## 🚀 Deploy

_A ser implementado_

- CI/CD (GitHub Actions)
- Terraform/Bicep (Azure)
- Containers e orquestração

## 📊 Diagramas

### Fluxo de Importação BIM

```text
Upload IFC → Parser (Engine C++) → JSON normalizado → API REST → PostgreSQL
                                                              ↓
                                                        RabbitMQ (evento)
```

### Fluxo de Simulação 4D

```text
Timeline (data) → Query atividades ativas → Calcular estados elementos
                                                    ↓
                                            Aplicar visual (Three.js)
```

### Fluxo Sincronização Offline

```text
App Field → SQLite local → Fila pendente → Worker sync → API REST
  (offline)                                   (online)
```

## 🔗 Links Externos

- [.NET 8 Documentation](https://learn.microsoft.com/dotnet/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Flutter Documentation](https://flutter.dev/docs)
- [ifcopenshell](http://ifcopenshell.org/)

## 📝 Contribuindo

1. Leia o código de conduta (TBD)
2. Revise ADRs relevantes
3. Mantenha documentação atualizada
4. Escreva testes para novas funcionalidades

## 📅 Histórico de Atualizações

| Data | Versão | Mudanças |
|------|--------|----------|
| Nov 2024 | 1.1 | Adicionada estratégia de marketing completa |
| Nov 2024 | 1.0 | Estrutura inicial, ADRs 1-7, MVP especificado |

---

**Manutenção**: Atualizar este índice ao adicionar novos documentos ou ADRs.
