# ADR-002: Barramento de Eventos

## Contexto

Precisamos desacoplar registro de progresso, atualização de custos, novas versões de modelo e geração de métricas.

## Decisão

Usar RabbitMQ no MVP com tópicos (exchanges) específicos e filas por serviço consumidor.

## Exchanges e Routing Keys

- `modelo.events` → `novaVersao`
- `progresso.events` → `registrado`
- `custo.events` → `atualizado`
- `alerta.events` → `desvio`

## Formato Mensagem (JSON)

```
{
  "eventId": "uuid",
  "type": "progresso.registrado",
  "timestamp": "ISO8601",
  "tenantId": "uuid",
  "payload": { ... }
}
```

## Alternativas

- Kafka: só após necessidade de alto throughput / retenção histórica longa.
- Direct REST callbacks: acoplamento maior.

## Consequências

+ Simplicidade operacional.
- Facilidade de retry por fila.

- Migração futura exige refatorar produtor para usar Kafka libs.
