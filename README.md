# Guido

O Guido é uma plataforma de inclusão digital para pessoas idosas e quem tem pouca familiaridade com tecnologia. Este repositório contém um MVP navegável com catálogo, busca local, escolha entre Android e iPhone e um guia educativo fictício de pagamento de boleto.

> **Aviso:** o guia financeiro é demonstrativo, não oficial e pendente de validação humana. O Guido não acessa bancos, não coleta dados bancários e não realiza nem confirma pagamentos.

## Stack

- Next.js com App Router, React e TypeScript estrito;
- Tailwind CSS e ESLint;
- Supabase JS/SSR para futura conexão com PostgreSQL, Auth e Storage;
- Zod para validar formulários, ambiente e progresso local;
- Vitest, jsdom e Testing Library para testes.

O backend futuro continuará integrado ao Next.js. Não há Python, backend separado, Docker, migration ou projeto remoto nesta versão. O manifesto web oferece a fundação para uma futura PWA, ainda sem service worker ou instalação offline.

## Requisitos

- Node.js 20.9 ou superior (desenvolvido com 22.23.1);
- npm 10 ou superior.

## Instalação e execução

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. As variáveis podem permanecer vazias: catálogo, busca e guia funcionarão normalmente; apenas autenticação ficará indisponível.

## Variáveis de ambiente

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Para habilitar Auth, crie manualmente um projeto no painel do Supabase, copie a URL e a chave pública/anon para `.env.local` e configure os URLs de redirecionamento no Auth. Nunca use `service_role` no navegador. Consulte [docs/SUPABASE.md](docs/SUPABASE.md).

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | servidor local de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | executar o build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emissão |
| `npm test` | suíte Vitest |
| `npm run test:watch` | testes em modo interativo |

## Limitações do MVP

- dados de catálogo e guias são locais;
- somente “Pagar um boleto” é navegável e suas telas são placeholders;
- o guia é genérico, não corresponde a um banco ou versão de aplicativo;
- autenticação exige configuração manual do Supabase e ainda não possui middleware de renovação de sessão;
- progresso fica apenas no navegador atual;
- não há painel administrativo, upload, offline, analytics, OCR ou integração bancária;
- logos oficiais não foram incluídos; cartões usam abreviações textuais.

Leia também [arquitetura](docs/ARQUITETURA.md), [decisões](docs/DECISOES.md), [pesquisa](docs/PESQUISA_GUIAS.md) e [segurança](docs/SEGURANCA.md).
