# Autenticação independente

Guido agora possui Auth próprio, sem Supabase.

## Local

1. Crie banco PostgreSQL vazio.
2. Configure `DATABASE_URL`, `AUTH_SESSION_SECRET` e `AUTH_BASE_URL` em `.env.local`.
3. Execute:

```bash
npm run db:migrate
npm run dev
```

Sem SMTP, confirmação de conta e recuperação de senha são gravadas em `LOCAL_EMAIL_OUTBOX_DIR` (padrão `.local/email`). Abra o link contido no arquivo para testar o fluxo completo.

## Modelo

`users` guarda identidade Guido e hash Argon2id. `user_identities` guarda os provedores `password` e `google`. `sessions` guarda somente hash do token. Tokens de confirmação e recuperação são aleatórios, com hash, expiração e uso único.

Cookies são HttpOnly, SameSite=Lax e Secure em produção. Logout revoga sessão. Reset de senha revoga sessões existentes.

## Google

Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI`. O callback usa state assinado, PKCE, nonce, JWKS do Google e exige `email_verified=true`. A identidade permanente usa Google `sub`. E-mail verificado igual pode vincular Google a conta Guido existente.

Sem essas variáveis, a rota Google retorna erro de configuração claro; email/password continua disponível.

## Limites atuais

Rate limiting básico existe por processo; proteção distribuída ainda precisa ser adicionada antes de produção. SMTP está implementado via Nodemailer, mas exige credenciais reais. Migração de usuários, sessões, banco antigo e objetos Supabase não foi executada.
