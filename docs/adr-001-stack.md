# ADR-001: Escolha de Stack Inicial

## Contexto

Necessidade de alta performance para parsing e simulação 4D, interoperabilidade BIM e rápida entrega web/mobile.

## Decisão

- Engine: C++ (performance, ecossistema BIM, possível WASM futuro).
- Backend: .NET 8 (robusto, alta performance, suporte corporativo, boas libs JWT/RBAC).
- Web: React + Three.js (flexibilidade para integração futura com WASM da engine).
- Mobile: Flutter (offline-first, single codebase, boa performance UI).
- Mensageria: RabbitMQ (simplicidade inicial, pode migrar para Kafka quando throughput exigir).
- Banco principal: PostgreSQL (relacional + JSONB flexível). TimescaleDB extensão para séries temporais.

## Alternativas Consideradas

- Node.js para backend (maior agilidade inicial) → descartado para priorizar performance e tipagem forte integrada.
- Rust para engine → maturidade menor de libs BIM.
- Unreal/Unity para 4D Pro web → descarte por peso e dependências.

## Consequências

+ Performance sustentada.
- Facilidade de contratação (C++/.NET/React).

- Curva de integração WASM mais trabalhosa.
