# API C++ arquivada

> Este documento descreve a implementação anterior, substituída pelo ADR-002. Os endpoints abaixo não participam mais do runtime ou da publicação do Guido.

O contrato executável está em [`docs/api/openapi.yaml`](api/openapi.yaml). A versão inicial expõe leitura pública do catálogo, health checks e progresso autenticado.

## Convenções

- prefixo versionado `/api/v1`;
- JSON em UTF-8;
- limite máximo de 50 registros por página;
- `X-Request-Id` aceito e devolvido, com geração no servidor quando ausente;
- erros no formato `{ "error": { "code", "message", "requestId" } }`;
- mensagens públicas não incluem SQL, stack trace ou caminhos internos;
- respostas atuais usam `Cache-Control: no-store` até a política de cache por status ser consolidada.

## Estado atual

O adaptador PostgreSQL assíncrono é ativado por `GUIDO_DATABASE_URL`. Sem ele, desenvolvimento usa somente o guia fictício em memória; produção recusa iniciar. O frontend usa `GUIDO_API_URL` apenas no servidor e mantém fallback local durante a migração.

## Endpoints implementados

- `GET /healthz`;
- `GET /readyz`;
- `GET /api/v1/applications`;
- `GET /api/v1/applications/{slug}`;
- `GET /api/v1/applications/{slug}/tutorials`;
- `GET /api/v1/tutorials/{slug}?platform=android|ios`;
- `GET /api/v1/guides/{id}`;
- `GET /api/v1/search?q=...&limit=...`.
- `GET /api/v1/me/progress/{guideId}`;
- `PUT /api/v1/me/progress/{guideId}`.

Os endpoints C++ de progresso estão arquivados. Runtime atual usa `/api/progress` e `/api/progress/{guideId}` com cookie HttpOnly Guido, sessão validada server-side, `user.id` derivado do cookie e SQL parametrizado.
