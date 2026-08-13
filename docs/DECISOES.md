# Decisões técnicas

## Backend C++

O backend é um processo separado em C++20 com Drogon e CMake por decisão explícita do produto. A motivação, alternativas e custos estão em [`ADR-001`](adr/ADR-001-backend-cpp-drogon.md). A antiga decisão que excluía C++ foi substituída.

## Monólito modular

Há um frontend e uma API, mas não há microsserviços. O backend separa controllers, casos de uso, domínio, repositórios e infraestrutura para evitar regras em handlers e SQL espalhado.

## PostgreSQL e Supabase

PostgreSQL foi confirmado pelo modelo relacional, constraints, transações, busca textual e auditoria. Supabase fornece hospedagem, Auth e Storage. Nenhum projeto é criado automaticamente e nenhuma chave administrativa é exposta no frontend.

## Progresso durante a migração

O progresso local validado permanece funcionando para visitantes. A persistência remota será adicionada para usuários autenticados com upsert idempotente e isolamento por usuário; o fallback não armazena dados financeiros.

## Android e iOS

Cada versão de guia possui plataforma explícita. Etapas e mídias podem ser reaproveitadas apenas quando a revisão confirmar que a interface é igual; não se presume equivalência.

## Revisão humana

Somente conteúdo `published` pode representar guia real. Demonstrações mantêm `draft` e `is_demo=true`. Pesquisa, OCR ou IA futura nunca alteram o status para publicado.

## Tecnologias adiadas

Python continua fora do runtime principal e só será considerado para processamento especializado. Redis, Kafka, RabbitMQ, Kubernetes, Elasticsearch, vector database, CQRS e event sourcing não possuem justificativa atual.

