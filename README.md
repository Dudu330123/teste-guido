# Guido

O Guido é uma plataforma de inclusão digital para pessoas idosas e quem tem pouca familiaridade com tecnologia. O projeto usa Next.js e Supabase para entregar catálogo, guias, progresso e autenticação.

> **Aviso:** o guia financeiro é fictício, não oficial e pendente de validação humana. O Guido não acessa bancos, não coleta dados bancários e não realiza nem confirma pagamentos.

## Stack

- Next.js App Router, React, TypeScript estrito e Tailwind CSS;
- PostgreSQL, Auth e Storage pelo Supabase;
- Zod para validação nas fronteiras do frontend;
- Vitest e Testing Library.

## Requisitos

- Node.js 20.9 ou superior e npm 10 ou superior;
- Node/npm para a execução local. O Supabase é opcional nesta fase e será conectado depois para autenticação, progresso e administração.

## Instalação

```bash
npm install
cp .env.example .env.local
```

O catálogo e as imagens locais funcionam sem credenciais. A integração remota do Supabase será configurada em uma fase posterior.

## Execução local

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Integrações futuras (`.env.local`):

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

As chaves do Supabase serão usadas somente quando a integração for ativada. Nunca
use `service_role`, `sb_secret_...`, senha do banco ou token administrativo no navegador.

## Validação

```bash
./scripts/check
```

O comando executa lint, tipos, testes e build. Comandos individuais:

```bash
npm run lint
npm run typecheck
npm run validate-images
npm test
npm run build
```

## Banco de dados

As migrations ficam em `supabase/migrations` para a fase posterior do Supabase. Elas não são aplicadas pelo fluxo local atual; quando a integração começar, a CI deverá aplicar todas em ordem.

## Estado atual e limitações

- catálogo, roteiros e imagens demonstrativas versionados localmente;
- visualizador dinâmico por tarefa e plataforma;
- schema PostgreSQL independente versionado; autorização acontece no servidor Next.js;
- somente “Pagar um boleto” é navegável e usa telas fictícias;
- conteúdo de WhatsApp, Gov.br e instituições financeiras permanece em preparação;
- progresso e autenticação remotos ficam para a integração do Supabase;
- o painel `/admin` serve para prévia editorial, sem endpoint de upload público;
- imagens ficam em `public/images/guide-screens` e são atualizadas por mudança versionada, revisão humana e deploy;
- `npm run validate-images` verifica bytes, extensão, tamanho, dimensões e associação com o manifesto;
- não há OCR, integração bancária ou offline completo.

Consulte [arquitetura](docs/ARQUITETURA.md), [API](docs/API.md), [banco](docs/DATABASE.md), [segurança](docs/SEGURANCA.md), [preparação do OpenClaw](openclaw/README.md) e [testes](docs/TESTING.md).

## Publicação do frontend

O frontend e seus Route Handlers podem ser publicados na Vercel. Consulte [Supabase](docs/SUPABASE.md) e [publicação na Vercel](docs/PUBLICACAO_VERCEL.md).
O Netlify permanece apenas como publicação anterior durante a transição.

O diretório `backend/` contém a implementação C++ anterior, congelada apenas como referência durante a migração. Ela não participa mais do build, da CI ou da execução do Guido.

Site publicado: `https://guido-orpin.vercel.app`.
