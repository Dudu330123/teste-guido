# Guido

O Guido é uma plataforma de inclusão digital para pessoas idosas e quem tem pouca familiaridade com tecnologia. O projeto usa Next.js e Supabase para entregar catálogo, guias, autenticação, mídia e progresso com uma operação simples de publicar e manter.

> **Aviso:** o guia financeiro é fictício, não oficial e pendente de validação humana. O Guido não acessa bancos, não coleta dados bancários e não realiza nem confirma pagamentos.

## Stack

- Next.js App Router, React, TypeScript estrito e Tailwind CSS;
- PostgreSQL pelo Supabase;
- Supabase Auth e Storage;
- Zod para validação nas fronteiras do frontend;
- Vitest e Testing Library.

## Requisitos

- Node.js 20.9 ou superior e npm 10 ou superior;
- um projeto Supabase para autenticação e persistência remota.

## Instalação

```bash
npm install
cp .env.example .env.local
```

Não é necessário preencher credenciais para usar a demonstração local. Sem Supabase, autenticação exibe uma mensagem amigável e o conteúdo fictício usa o fallback local.

## Execução local

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Frontend (`.env.local`):

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
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

As migrations estão em `supabase/migrations`, foram aplicadas ao projeto remoto e
serão sincronizadas com a `main` pela integração oficial entre Supabase e GitHub.
`supabase/seed.sql` contém apenas a demonstração fictícia em status `draft`.

## Estado atual e limitações

- catálogo e guias lidos diretamente do Supabase com validação e fallback local da demonstração;
- visualizador dinâmico por tarefa e plataforma;
- schema PostgreSQL e RLS versionados, validados em banco efêmero e aplicados ao Supabase remoto;
- somente “Pagar um boleto” é navegável e usa telas fictícias;
- conteúdo de WhatsApp, Gov.br e instituições financeiras permanece em preparação;
- progresso fica local para visitantes e sincroniza diretamente com PostgreSQL para sessões validadas pelo Supabase;
- autenticação usa Supabase Auth e o painel `/admin` exige vínculo ativo em `team_members`;
- somente `superadmin` acessa o painel e publica prints demonstrativos imediatamente por banco, celular e passo;
- imagens públicas ficam no Storage e substituem somente a tela do passo; instruções continuam controladas pelo guia;
- não há OCR, integração bancária ou offline completo.

Consulte [arquitetura](docs/ARQUITETURA.md), [API](docs/API.md), [banco](docs/DATABASE.md), [segurança](docs/SEGURANCA.md) e [testes](docs/TESTING.md).

## Publicação do frontend

O frontend e seus Route Handlers estão publicados na Vercel; PostgreSQL, Auth e
Storage continuam no Supabase. Consulte [a documentação da Vercel](docs/PUBLICACAO_VERCEL.md).
O Netlify permanece apenas como publicação anterior durante a transição.

O diretório `backend/` contém a implementação C++ anterior, congelada apenas como referência durante a migração. Ela não participa mais do build, da CI ou da execução do Guido.

Site publicado: `https://guido-orpin.vercel.app`.
