# ADR-003: Estratégia Offline Sync (Field)

## Contexto

Equipe de campo opera em ambientes com conectividade instável.

## Decisão

Implementar fila local (SQLite) com registros pendentes e worker de sincronização incremental.

## Mecanismo

1. Registro criado → status `pending`.
2. Worker tenta envio (batch ou individual).
3. Sucesso → status `sent` + carimbo servidor.
4. Falha → backoff exponencial (máx 5 min) e permanece `pending`.

## Conflitos

Último timestamp vence, manter audit trail completo.

## Alternativas

- Sincronização a cada ação (impraticável sem rede estável).
- Armazenar em arquivos locais → menos robusto.

## Consequências

+ Robustez offline.
- Simples de depurar.

- Tuning de tamanho de fila e consumo de bateria.
