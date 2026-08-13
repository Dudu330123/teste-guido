# ADR-002 — Next.js e Supabase como backend do produto

## Status

Aceita. Substitui o ADR-001 para a aplicação ativa.

## Contexto

O backend C++ validou contratos e o modelo PostgreSQL, mas exigia hospedagem, autenticação, observabilidade e deploy separados. O objetivo atual é colocar o Guido em produção com uma equipe pequena, mantendo segurança e capacidade de crescimento.

## Decisão

O Next.js permanece como aplicação única. Supabase fornece PostgreSQL, Auth e Storage. Leituras públicas e operações do usuário usam a chave publicável com RLS. Route Handlers validam sessão e entradas nas fronteiras que exigem coordenação no servidor. Edge Functions serão adicionadas somente quando uma integração externa ou processamento isolado justificar.

O código C++ fica congelado durante a transição e não participa mais da CI ou do runtime.

## Consequências

- um deploy web e um projeto Supabase substituem dois serviços próprios;
- catálogo, guias, mídia e progresso usam a mesma identidade e políticas;
- RLS e testes negativos tornam-se controles críticos;
- há maior dependência das APIs Supabase, mitigada pelo uso de PostgreSQL e migrations versionadas;
- tarefas pesadas futuras continuam podendo ser isoladas sem alterar a jornada principal.
