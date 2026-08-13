# Estratégia de testes

## Frontend

Vitest, jsdom e Testing Library validam navegação do guia, armazenamento local, escolha de aparelho, controles acessíveis, pesquisa, aviso financeiro e parsing do contrato da API.

## Supabase e banco

A CI aplica as migrations em PostgreSQL efêmero e valida as políticas públicas da demonstração e o bloqueio de tabelas administrativas. Testes futuros obrigatórios: token real do usuário A não lê/escreve progresso de B; usuário comum não acessa administração; IDs manipulados não contornam ownership.

## Comando único

`./scripts/check` executa lint, tipos, testes e build do Next.js. A CI cria PostgreSQL efêmero, aplica todas as migrations e o seed e confirma que a demonstração é pública sem conceder acesso às tabelas administrativas.

Sanitizers serão executados em job próprio quando o toolchain estiver disponível, porque dobrar todos os builds locais prejudicaria o ciclo rápido. Nenhum benchmark de capacidade será declarado antes de endpoints e banco reais.
