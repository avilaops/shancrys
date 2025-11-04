# Arquitetura Macro Shancrys

## Visão em Camadas

- **Interface**: Web (React/Three.js), Mobile (Flutter).
- **Serviços**: API (.NET 8), Analytics (Python), Autenticação/RBAC.
- **Engine 3D/4D**: C++ nativo (parsing, simulação, cálculo progressivo) + camada WASM futura.
- **Dados**: PostgreSQL + JSONB (entidades principais), Blob Storage (modelos originais), TimescaleDB (séries), Redis (cache quente), RabbitMQ (eventos).

## Fluxo Importação

Upload → Parser IFC/DGN → Normalização (LOD) → Indexação espacial (BVH) → Persistência → Evento `modelo.novaVersao`.

## Eventos (RabbitMQ)

- `progresso.campo.registrado`
- `modelo.novaVersao`
- `custo.atualizado`
- `alerta.desvio`

## Segurança

- Multi-tenant (TenantId em todas as tabelas / claims JWT).
- Papéis: Admin, Planejador, Campo, Financeiro, Leitor.
- Possível ABAC por disciplina.

## Escalabilidade

- Stateless API + horizontal scaling.
- Engine pode rodar como serviço separado para pré-processamento pesado.
- CDN para distribuição de malhas simplificadas.

## Observabilidade

OpenTelemetry (traces + métricas), logs estruturados JSON, dashboards Grafana.

## Decisões Iniciais (ADR)

1. C++ escolhido para engine por maturidade em performance e integração BIM.
2. .NET 8 para API pela robustez corporativa e performance.
3. Flutter para experiência consistente e offline.
4. RabbitMQ no MVP pela simplicidade operacional.
