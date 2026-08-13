# Guido

O Guido é uma plataforma de inclusão digital para pessoas idosas e quem tem pouca familiaridade com tecnologia. O projeto contém um frontend Next.js navegável e a fundação funcional de uma API C++20/Drogon para catálogo e guias.

> **Aviso:** o guia financeiro é fictício, não oficial e pendente de validação humana. O Guido não acessa bancos, não coleta dados bancários e não realiza nem confirma pagamentos.

## Stack

- Next.js App Router, React, TypeScript estrito e Tailwind CSS;
- C++20, Drogon, CMake e Ninja;
- PostgreSQL pelo Supabase;
- Supabase Auth e Storage;
- Zod para validação nas fronteiras do frontend;
- Vitest/Testing Library e CTest.

## Requisitos

- Node.js 20.9 ou superior e npm 10 ou superior;
- compilador C++20;
- CMake, Ninja, Drogon e libpq.

No Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y cmake ninja-build libdrogon-dev libpq-dev postgresql-client \
  libjsoncpp-dev default-libmysqlclient-dev libhiredis-dev libyaml-cpp-dev
```

## Instalação

```bash
npm install
cp .env.example .env.local
cmake -S backend -B backend/build -G Ninja -DCMAKE_BUILD_TYPE=Debug -DBUILD_TESTING=ON
cmake --build backend/build --parallel
```

Não é necessário preencher credenciais para usar a demonstração local. Sem Supabase, Auth exibe uma mensagem amigável; sem API C++, o frontend usa temporariamente seus dados locais.

## Execução local

Terminal 1 — API C++:

```bash
./scripts/dev-backend
```

Terminal 2 — frontend:

```bash
npm run dev
```

Abra `http://localhost:3000`. A API responde em `http://127.0.0.1:8080/healthz`.

## Variáveis de ambiente

Frontend (`.env.local`):

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GUIDO_API_URL=http://127.0.0.1:8080
```

Backend (`.env.backend.local`, ignorado pelo Git):

```text
GUIDO_ENV=development
GUIDO_API_HOST=127.0.0.1
GUIDO_API_PORT=8080
GUIDO_DATABASE_URL=
GUIDO_DATABASE_POOL_SIZE=4
GUIDO_SUPABASE_URL=
GUIDO_SUPABASE_PUBLISHABLE_KEY=
GUIDO_STORAGE_BUCKET=guide-media
```

Use a chave pública `sb_publishable_...` nos dois arquivos. Nunca use
`service_role`, `sb_secret_...`, senha do banco ou token administrativo no navegador.

## Validação

```bash
./scripts/check
```

O comando executa lint, tipos, testes e build do frontend, seguido por build e testes do backend. Comandos individuais:

```bash
npm run lint
npm run typecheck
npm test
npm run build
cmake --build backend/build --parallel
ctest --test-dir backend/build --output-on-failure
```

## Banco de dados

As migrations estão em `database/migrations`, mas não são aplicadas automaticamente. Antes de executá-las, crie manualmente o projeto Supabase, revise o schema/RLS e configure credenciais fora do Git. `database/seeds/development.sql` contém apenas a demonstração fictícia em status `draft`.

## Estado atual e limitações

- API pública de leitura, health, readiness e busca com adaptadores em memória e PostgreSQL assíncrono;
- visualizador de boleto integrado à API com fallback local;
- schema PostgreSQL, RLS e OpenAPI versionados e validados em banco efêmero, ainda não aplicados remotamente;
- somente “Pagar um boleto” é navegável e usa telas fictícias;
- conteúdo de WhatsApp, Gov.br e instituições financeiras permanece em preparação;
- progresso fica local para visitantes e sincroniza com PostgreSQL para sessões validadas pelo Supabase;
- autenticação chama Supabase Auth quando configurada, mas autorização administrativa ainda não está ativa;
- não há upload, painel administrativo, OCR, integração bancária ou offline completo.

Consulte [arquitetura](docs/ARQUITETURA.md), [API](docs/API.md), [banco](docs/DATABASE.md), [segurança](docs/SEGURANCA.md) e [testes](docs/TESTING.md).

## Publicação do frontend

O frontend está preparado para Netlify por `netlify.toml`. A API C++ precisa de
hospedagem própria e será conectada posteriormente por uma URL HTTPS. Consulte
[a documentação de publicação](docs/PUBLICACAO_NETLIFY.md).

Prévia publicada: `https://guido-ajuda-digital.netlify.app`.
