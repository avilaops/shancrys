# Escopo MVP Detalhado

## Shancrys 4D Pro

- Importar arquivo IFC (v4) e DGN.
- Extrair metadados: GUID, disciplina, tipo, volume.
- Gerar LOD simplificado (redução polígonos >70%).
- Interface para seleção múltipla de elementos.
- Vincular elementos a atividade (drag & drop / seleção por filtro disciplina).
- Play/Pause timeline: barra temporal com estados visuais.
- Estados visuais: NotStarted (wireframe), InProgress (semi translúcido), Completed (opaco).

## Shancrys Control

- Listar versões de modelo (hash + data + autor + total elementos).
- Upload nova versão + diff simples (contagem added/removed).
- Gestão de documentos (apenas metadados + download). Simples.

## Shancrys Field

- Login offline (cache token válido).
- Registrar progresso percentual em atividades.
- Capturar foto (linkada à atividade ou elemento).
- Sincronização fila pendente (retries, marca status enviado).

## Shancrys Perform

- Curva S (progresso acumulado planejado vs realizado).
- Top 5 atividades atrasadas (dias de atraso).
- Custo acumulado vs previsto (linha simples).

## Critérios de Sucesso

- Importar e preparar modelo médio < 10s.
- 30fps na simulação de timeline para LOD médio.
- Sincronização offline de registros em até 60s após reconexão.
- Dashboard carregando métricas em < 3s com dados de 30 dias.

## Fora do Escopo (MVP)

- Multi-região ativa.
- Forecast avançado (machine learning).
- Clash detection completo.
- Realidade aumentada.

## Riscos MVP

- IFC complexidade → reduzir inicialmente suporte avançado (instâncias MEP detalhadas).
- Fotos grandes impactando sincronização → compressão jpeg < 1MB.
