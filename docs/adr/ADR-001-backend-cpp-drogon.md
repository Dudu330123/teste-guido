# ADR-001 — Backend C++20 com Drogon

> **Substituído pelo ADR-002.** Mantido apenas como registro histórico da decisão anterior.

**Status:** aceito em 10 de agosto de 2026.

## Contexto

O MVP nasceu como uma aplicação Next.js com catálogo e guias locais. O produto precisa permitir atualização de conteúdo, controle de publicação, progresso autenticado, auditoria e imagens no Storage sem recompilar o frontend. A pessoa responsável pelo produto definiu explicitamente que o backend deve ser escrito em C++.

## Decisão

Adotar um monólito modular separado em C++20, Drogon e CMake. O frontend Next.js consome uma API REST `/api/v1`. PostgreSQL/Supabase persiste dados estruturados, Supabase Auth mantém identidades e Supabase Storage guarda mídias.

O backend separa HTTP, casos de uso, domínio, repositórios e infraestrutura. O primeiro adaptador em memória permite validar a API antes de conectar o banco. Ele não é uma opção de produção.

## Alternativas consideradas

- Route Handlers do Next.js: menor custo operacional, rejeitado pela decisão explícita de usar C++.
- Backend TypeScript separado: compartilharia tipos com o frontend, mas não atende à escolha tecnológica.
- Microsserviços: rejeitados por aumentarem complexidade sem escala ou domínios comprovados.

## Consequências

- duas aplicações precisam ser compiladas, implantadas e observadas;
- contratos HTTP e modelos precisam permanecer sincronizados;
- o desenvolvimento local exige CMake, Drogon e PostgreSQL/libpq;
- C++ demanda sanitizers, warnings fortes, ownership explícito e testes de entrada maliciosa;
- o frontend preserva fallback local apenas durante a migração; produção deverá exigir a API.
