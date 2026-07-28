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

## Migração aperfeiçoada do MVP Vite anterior

O MVP anterior foi analisado em 28 de julho de 2026. A base Next.js foi preservada e suas funcionalidades foram reimplementadas: identidade azul, mockup visual mais detalhado, sugestões rápidas, termos alternativos, seis ações, dez aplicativos financeiros e o fluxo ação → aplicativo. Não foram importados Vite, arquivos compilados, dependências antigas, código sem uso ou marcas aproximadas.

As 60 combinações financeiras são geradas por dados normalizados, em vez de manter cópias iguais por banco. Todas permanecem `draft` e `preparing`; nenhuma abre guia até possuir pesquisa oficial e revisão humana. Tarefas recuperadas para WhatsApp, Gov.br, segurança e atendimento seguem a mesma regra. Passos antigos que mencionavam senha, biometria, inserção de códigos, envio de Pix ou confirmação financeira foram descartados.

### Disponibilidade por tarefa

O campo `availability` diferencia `demo` de `preparing`. O status do aplicativo não determina mais, sozinho, se uma tarefa abre um guia. Isso impede que rascunhos se tornem navegáveis quando um mesmo aplicativo também possuir uma demonstração.
