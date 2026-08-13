# Estratégia de testes

## Frontend

Vitest, jsdom e Testing Library validam navegação do guia, armazenamento local, escolha de aparelho, controles acessíveis, pesquisa, aviso financeiro e parsing do contrato da API.

## Backend

CTest executa testes do serviço de catálogo sem rede. Os testes cobrem paginação, validação de slug, plataformas permitidas, pesquisa, guia demonstrativo e aviso financeiro.

Uma suíte CTest separada usa `GUIDO_TEST_DATABASE_URL` e valida upsert, leitura e rejeição de etapa inexistente em PostgreSQL real. Sem a variável, o teste é marcado como ignorado. A CI prepara schema, RLS e seed em PostgreSQL 18 efêmero. Testes futuros obrigatórios: token real do usuário A não lê/escreve progresso de B; usuário comum não acessa administração; IDs manipulados não contornam ownership.

## Comando único

`./scripts/check` executa lint, tipos, testes e build do frontend, seguido de configure/build/testes do backend. Se o toolchain C++ não estiver instalado, o comando falha com a instrução correspondente, em vez de fingir que validou o backend.

Sanitizers serão executados em job próprio quando o toolchain estiver disponível, porque dobrar todos os builds locais prejudicaria o ciclo rápido. Nenhum benchmark de capacidade será declarado antes de endpoints e banco reais.
