# ADR-007: Observabilidade

## Contexto

Necessário diagnosticar performance de importação, simulação e sincronização.

## Decisão

Adotar OpenTelemetry para traces (parser, simulação tick, sync offline), Prometheus para métricas, logs estruturados JSON (correlationId + tenantId). Dashboard Grafana consumindo métricas.

## Métricas-Chave

- tempo_importacao_segundos
- elementos_processados_total
- fps_simulacao_atual
- registros_sync_pendentes
- atraso_medio_atividades_dias

## Alternativas

- Log simples texto (menos estrutura).

## Consequências

+ Facilita escalabilidade e tuning.

- Requer setup inicial de stack observabilidade.
