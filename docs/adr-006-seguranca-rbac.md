# ADR-006: Segurança e RBAC

## Contexto

Múltiplos perfis de usuários e segregação por tenant.

## Decisão

JWT contendo claims: tenantId, roles[], optional disciplinas[]. Middleware valida tenant em cada requisição. Tabela Users com mapeamento de papéis. Regras avançadas (ABAC) aplicadas em nível de serviço.

## Papéis

- Admin: gestão usuários/projetos.
- Planejador: cronograma e vinculação.
- Campo: registros progresso/fotos.
- Financeiro: custos e relatórios.
- Leitor: somente leitura.

## Alternativas

- ACL por recurso individual (excesso para MVP).

## Consequências

+ Simples, extensível.
- Integra bem com frameworks atuais.

- Futuro ABAC requer expansão claims.
