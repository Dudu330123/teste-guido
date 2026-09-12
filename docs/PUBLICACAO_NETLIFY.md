# Publicação do frontend no Netlify

O Netlify publica o aplicativo Next.js usando o adaptador OpenNext gerenciado
pela plataforma. Não adicione `@netlify/plugin-nextjs`: a configuração moderna é
automática e suporta App Router, SSR, Route Handlers e Middleware.

## Escopo da primeira publicação

A URL pública executa o Next.js e seus Route Handlers. Login, sincronização e conteúdo PostgreSQL são ativados pelas variáveis independentes Guido; sem banco, o frontend usa somente o fallback demonstrativo identificado como fictício.

Projeto Netlify atual:

- produção: `https://guido-assistente-digital.netlify.app`;
- painel: `https://app.netlify.com/projects/guido-assistente-digital`.

Projetos novos podem herdar visibilidade privada da equipe. Para uma publicação
aberta, confirme **Project configuration > General > Visitor access > Project
visibility > Public**. A produção só é considerada pública depois de uma
requisição sem sessão Netlify responder com sucesso.

## Configuração

- build: `npm run build`;
- diretório detectado: `.next`;
- runtime: Node.js 22 LTS;
- arquivo: `netlify.toml`.

No painel do Netlify, as variáveis devem ser cadastradas em **Project
configuration > Environment variables**, nunca gravadas no repositório:

```text
DATABASE_URL=
AUTH_SESSION_SECRET=
AUTH_BASE_URL=https://seu-dominio.example
EMAIL_FROM=Guido <no-reply@seu-dominio.example>
```

Google OAuth e SMTP são opcionais, mas exigem as variáveis descritas em
`docs/INDEPENDENT_AUTH.md`. Nunca configure no código ou no navegador senha
PostgreSQL, client secret ou token administrativo.

## Autenticação

Depois que existir uma URL pública definitiva, use-a em `AUTH_BASE_URL` e nas
URLs autorizadas do Google OAuth, se o provedor estiver ativo.

## Atualizações

O fluxo recomendado é conectar o repositório GitHub ao Netlify para que cada
push autorizado gere um novo deploy. Deploy manual pela CLI serve apenas para a
primeira prévia ou diagnóstico.
