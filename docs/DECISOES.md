# Decisões técnicas

## Next.js e monólito modular

Next.js com App Router reúne páginas, renderização e futuras rotas de backend em uma implantação simples. A organização por `features` mantém limites de domínio sem criar microsserviços ou abstrações prematuras.

## Supabase

Supabase foi escolhido para PostgreSQL, Auth e Storage gerenciados. Os clientes estão preparados, mas retornam `null` quando faltam variáveis. O projeto remoto e as migrations devem ser criados manualmente somente após revisão de segurança e dados.

## Progresso local no MVP

O progresso usa `localStorage`, validado por schema e isolado da UI. Isso evita dependência de conta e permite migrar a persistência futuramente. Nada digitado, financeiro ou pessoal é armazenado.

## Android e iOS separados

Cada sistema possui um `Guide` próprio, mesmo enquanto os passos fictícios coincidem. Interfaces reais divergem por plataforma e devem ser pesquisadas e revisadas separadamente.

## Revisão humana obrigatória

Pesquisa, OCR ou automação futura nunca publica um guia. Uma pessoa autorizada precisa verificar origem, versão, segurança, acessibilidade e fidelidade antes do status `published`.

## Tecnologias excluídas

C++ não se aplica ao produto web e fica excluído. Python não é necessário nesta fase; poderá ser avaliado apenas para processamento especializado futuro. Não há backend separado, Docker ou microsserviços.
