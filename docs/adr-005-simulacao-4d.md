# ADR-005: Estratégia de Simulação 4D

## Contexto

Necessário reproduzir evolução temporal do projeto com estados visuais por atividade.

## Decisão

Executar uma varredura de atividades por tick (dia) usando ordenação topológica do grafo de dependências. Progresso visual de elementos vinculado à média ponderada do progresso das atividades associadas (pesoProgresso). Renderização aplica material/shader conforme estado.

## Estados Visuais

- NotStarted: wireframe cinza.
- InProgress: interpolação cor (amarelo → verde) conforme percentual.
- Completed: sólido verde.
- Delayed: pulsar vermelho/laranja.

## Performance

- Pré-calcular lista de atividades ativas por intervalo.
- Agrupar draw calls por material (instancing quando possível).

## Alternativas

- Simulação por elemento (custoso) vs por atividade agregada.

## Consequências

+ Escalável para dezenas de milhares de elementos.
- Facilidade de ajuste de estilos.

- Requer pré-processo quando cronograma muda.
