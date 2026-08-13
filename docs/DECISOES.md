# Decisões técnicas

## Backend integrado ao Next.js e Supabase

O produto ativo usa Next.js com PostgreSQL, Auth e Storage do Supabase. A decisão reduz hospedagem e integração duplicadas e está registrada no [`ADR-002`](adr/ADR-002-nextjs-supabase.md). O ADR-001 e o diretório C++ permanecem temporariamente apenas como histórico.

## Monólito modular

Há uma aplicação Next.js modular e serviços gerenciados do Supabase, sem microsserviços próprios. Consultas ficam centralizadas em `src/lib/supabase`, políticas em migrations e coordenação HTTP em Route Handlers pequenos.

## PostgreSQL e Supabase

PostgreSQL foi confirmado pelo modelo relacional, constraints, transações, busca textual e auditoria. Supabase fornece hospedagem, Auth e Storage. Nenhum projeto é criado automaticamente e nenhuma chave administrativa é exposta no frontend.

## Progresso durante a migração

O progresso local validado permanece funcionando para visitantes. Usuários autenticados sincronizam por Route Handlers com sessão validada, upsert idempotente e RLS por usuário; o fallback não armazena dados financeiros.

## Android e iOS

Cada versão de guia possui plataforma explícita. Etapas e mídias podem ser reaproveitadas apenas quando a revisão confirmar que a interface é igual; não se presume equivalência.

## Revisão humana

Somente conteúdo `published` pode representar guia real. Demonstrações mantêm `draft` e `is_demo=true`. Pesquisa, OCR ou IA futura nunca alteram o status para publicado.

## Tecnologias adiadas

Python continua fora do runtime principal e só será considerado para processamento especializado. Redis, Kafka, RabbitMQ, Kubernetes, Elasticsearch, vector database, CQRS e event sourcing não possuem justificativa atual.
