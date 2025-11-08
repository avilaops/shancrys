# Modelo de Dados (MVP)

## Projeto

- id (UUID)
- tenantId
- nome, localizacao, status
- criadoEm, atualizadoEm

## ModeloVersao

- id, projetoId
- hashArquivo, origem (IFC|DGN)
- statsElementos {total, porDisciplina}
- criadoEm, autor

## Elemento

- id, versaoId
- guidOriginal, disciplina, tipo
- geometriaRef (blobId / lodId)
- volumeEstimado, custoEstimado
- atributos (JSONB)

## Atividade

- id, projetoId
- wbsCode, nome
- startPlan, endPlan
- predecessoras ([]ids)
- recursosEstimados (JSONB)

## MapeamentoElementoAtividade

- id
- elementoId, atividadeId
- pesoProgresso (0..1)

## RegistroProgresso

- id
- atividadeId, elementoId?
- timestamp, autor
- tipo (percentual|foto|inspecao)
- valor (percentual ou metadados)
- geoRef {lat, lon?}
- arquivoMidiaId?

## CustoReal

- id
- projetoId, atividadeId?
- data, categoria, valor

## Produtividade

- id
- projetoId, atividadeId
- periodo (dia)
- unidade (ex: m3, m2)
- valor

## Alerta

- id
- projetoId
- tipo (atraso|custo|qualidade)
- severidade
- origem (sistema|usuario)
- criadoEm, resolvidoEm?

## Índices

- Elemento: versaoId + disciplina
- Atividade: projetoId + startPlan
- RegistroProgresso: atividadeId + timestamp
- CustoReal: projetoId + data

## Regras

- pesoProgresso soma por atividade ~ 1 (validação).
- predecessoras não podem formar ciclos (detecção topológica).
