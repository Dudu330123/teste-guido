# Guido

O Guido é uma plataforma de inclusão digital para pessoas idosas e quem tem pouca familiaridade com tecnologia. O projeto usa Next.js, PostgreSQL e serviços próprios de autenticação e mídia para entregar catálogo, guias e progresso sem depender do projeto Supabase de terceiros.

> **Aviso:** o guia financeiro é fictício, não oficial e pendente de validação humana. O Guido não acessa bancos, não coleta dados bancários e não realiza nem confirma pagamentos.

## Stack

- Next.js App Router, React, TypeScript estrito e Tailwind CSS;
- PostgreSQL independente;
- autenticação Guido com sessões próprias;
- armazenamento local/S3 compatível;
- Zod para validação nas fronteiras do frontend;
- Vitest e Testing Library.

## Requisitos

- Node.js 20.9 ou superior e npm 10 ou superior;
- PostgreSQL local configurado por `DATABASE_URL`.

## Instalação

```bash
npm install
cp .env.example .env.local
```

O catálogo fictício continua disponível sem banco. Para criar contas, progresso remoto e administração, configure PostgreSQL e execute `npm run db:migrate`. Sem credenciais Google, login por e-mail e senha continua disponível.

## Execução local

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Frontend (`.env.local`):

```text
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/guido
AUTH_SESSION_SECRET=replace-with-at-least-32-random-characters
```

Use a chave pública `sb_publishable_...`. Nunca use
`service_role`, `sb_secret_...`, senha do banco ou token administrativo no navegador.

## Validação

```bash
./scripts/check
```

O comando executa lint, tipos, testes e build. Comandos individuais:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Banco de dados

Migration inicial independente está em `db/migrations/001_independent_foundation.sql` e é executada por `npm run db:migrate`. `supabase/` permanece somente como histórico; nenhum dado do antigo projeto é acessado ou migrado nesta etapa.

## Estado atual e limitações

- catálogo e guias lidos de PostgreSQL com validação e fallback local da demonstração;
- visualizador dinâmico por tarefa e plataforma;
- schema PostgreSQL independente versionado; autorização acontece no servidor Next.js;
- somente “Pagar um boleto” é navegável e usa telas fictícias;
- conteúdo de WhatsApp, Gov.br e instituições financeiras permanece em preparação;
- progresso fica local para visitantes e sincroniza com PostgreSQL para sessões Guido válidas;
- autenticação usa sessões Guido e o painel `/admin` exige vínculo ativo em `team_members`;
- qualquer visitante pode publicar prints imediatamente em `/enviar-print`, mesmo sem login; somente `superadmin` acessa `/admin` e pode removê-los;
- imagens públicas ficam no adaptador de Storage local/S3 e substituem somente a tela do passo; instruções continuam controladas pelo guia;
- não há OCR, integração bancária ou offline completo.

Consulte [arquitetura](docs/ARQUITETURA.md), [API](docs/API.md), [banco](docs/DATABASE.md), [segurança](docs/SEGURANCA.md), [preparação do OpenClaw](openclaw/README.md) e [testes](docs/TESTING.md).

## Publicação do frontend

O frontend e seus Route Handlers podem ser publicados na Vercel; PostgreSQL, email e Storage são configurados separadamente. Consulte [autenticação independente](docs/INDEPENDENT_AUTH.md) e [Storage](docs/STORAGE.md).
O Netlify permanece apenas como publicação anterior durante a transição.

O diretório `backend/` contém a implementação C++ anterior, congelada apenas como referência durante a migração. Ela não participa mais do build, da CI ou da execução do Guido.

Site publicado: `https://guido-orpin.vercel.app`.
