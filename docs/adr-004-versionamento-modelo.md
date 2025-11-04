# ADR-004: Versionamento de Modelos BIM

## Contexto

Projetos geram múltiplas iterações de modelo IFC/DGN ao longo do tempo.

## Decisão

Armazenar cada upload completo (blob) + metadados. Calcular diff leve (contagem added/removed/changed) via comparação GUIDs por disciplina. Diferença geométrica detalhada (mesh delta) fica fora do MVP.

## Metadados

- hashArquivo (sha256)
- totalElementos
- porDisciplina {arq, estrut, elet, hidraulica}

## Alternativas

- Armazenar somente delta → complexidade alta no início.
- Sistema de patches binários → muito prematuro.

## Consequências

+ Implementação rápida.
- Recuperação de versão direta.

- Espaço maior em storage, mitigado por compressão.
