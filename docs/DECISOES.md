# Decisões técnicas

## Backend integrado ao Next.js

O produto ativo usa Next.js com autenticação própria, PostgreSQL independente e Storage local/S3. O ADR-002 anterior e diretório C++ permanecem como histórico.

## Monólito modular

Há uma aplicação Next.js modular, sem microsserviços próprios. Auth, consultas, autorização e Storage ficam em adapters pequenos e Route Handlers.

## PostgreSQL independente

PostgreSQL foi confirmado pelo modelo relacional, constraints, transações, busca textual e auditoria. Nenhum provedor é obrigatório; nenhum segredo administrativo é exposto no frontend.

## Progresso durante a migração

O progresso local validado permanece funcionando para visitantes. Usuários autenticados sincronizam por Route Handlers com sessão validada, upsert idempotente e RLS por usuário; o fallback não armazena dados financeiros.

## Android e iOS

Cada versão de guia possui plataforma explícita. Etapas e mídias podem ser reaproveitadas apenas quando a revisão confirmar que a interface é igual; não se presume equivalência.

## Revisão humana

Somente conteúdo `published` pode representar guia real. Demonstrações mantêm `draft` e `is_demo=true`. Pesquisa, OCR ou IA futura nunca alteram o status para publicado.

## Agentes externos adiados

Hermes ou OpenClaw poderão operar como orquestradores externos, com agentes
especializados para pesquisa, roteiro, mídia e verificação. A execução inicial
será sequencial e salvará somente rascunhos no Supabase; o Guido exibirá um
alerta e a publicação continuará humana. A especificação está em
[manual do OpenClaw](../openclaw/README.md).

## Tecnologias adiadas

Python continua fora do runtime principal e só será considerado para processamento especializado. Redis, Kafka, RabbitMQ, Kubernetes, Elasticsearch, vector database, CQRS e event sourcing não possuem justificativa atual.
