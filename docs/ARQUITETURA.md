# Arquitetura

## Visão geral

O Guido evolui para duas aplicações em um monólito modular por processo: frontend Next.js e backend C++20/Drogon. A separação é intencional e registrada no ADR-001.

```text
Navegador
   │ HTTPS/JSON
   ▼
Next.js ───────────────► API C++ / Drogon
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      PostgreSQL / Supabase       Supabase Storage
              │
              ▼
        Supabase Auth
```

O Next.js apresenta e mantém apenas estado visual. O C++ valida, autoriza e coordena. PostgreSQL garante integridade. Storage guarda mídia. Supabase Auth permanece a autoridade de identidade.

## Backend

```text
HTTP/controllers
        ↓
application/use cases
        ↓
domain + repository interfaces
        ↓
infrastructure adapters
        ↓
PostgreSQL / Storage / Auth
```

- `backend/include/guido/domain`: entidades e contratos independentes de HTTP;
- `backend/include/guido/application`: casos de uso e limites de entrada;
- `backend/src/http`: rotas, JSON e erros públicos;
- `backend/src/infrastructure`: adaptadores substituíveis;
- `backend/tests`: testes sem rede;
- `database/migrations`: schema versionado, nunca aplicado automaticamente;
- `docs/api/openapi.yaml`: contrato da API.

O adaptador em memória é transitório e permite validar o primeiro corte vertical. Ele não é fonte de verdade de produção. O adaptador PostgreSQL usa coroutines, pool explícito de 1 a 20 conexões e queries parametrizadas. Readiness consulta o banco e produção não inicia sem PostgreSQL e Supabase Auth.

## Frontend

- `src/app`: rotas, layout, metadados e manifesto;
- `src/features`: pesquisa, guias, progresso, tema e autenticação;
- `src/lib/api`: cliente server-side e validação de respostas da API;
- `src/data`: fallback temporário do MVP;
- `src/lib/supabase`: Supabase Auth opcional.

O guia de boleto tenta a API configurada em `GUIDO_API_URL`. Falha, timeout ou payload inválido voltam ao conteúdo local sem quebrar o usuário. O progresso continua local para visitantes e também é sincronizado, quando há sessão, por um proxy Next.js sem regra de negócio. Essa tolerância é apenas de migração; produção exige PostgreSQL e não serve rascunhos pela memória.

## Fluxo de conteúdo

1. editor cria um rascunho;
2. mídia permanece privada e passa por inspeção de formato, metadados e dados pessoais;
3. revisor humano compara origem, plataforma e versão;
4. aprovação e publicação são transacionais e auditadas;
5. API pública lê somente `published`;
6. conteúdo desatualizado é marcado sem apagar histórico necessário.

Nenhum guia pesquisado, importado ou gerado automaticamente é publicado.

## Evolução controlada

Renovação completa da sessão, Storage e administração ainda entram como módulos do mesmo backend. Catálogo PostgreSQL e progresso remoto já possuem adaptadores iniciais. Redis, workers, filas, IA e microsserviços permanecem fora até uma métrica ou caso de uso concreto justificá-los. Python poderá existir futuramente apenas como processamento isolado de imagem/OCR, nunca como requisito do backend principal.

## Fora do escopo

Integração bancária, pagamento, leitura real de código, OCR, ações automáticas, credenciais bancárias, dados de boletos pessoais, aplicativos nativos, sobreposição de tela e publicação automática.
