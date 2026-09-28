# Redesenho da página inicial do Guido

## Entrega

Página inicial com mensagem acolhedora, busca no catálogo existente, sugestões para começar, oito categorias, contagem de guias publicados e disponíveis e seção de segurança. Cards em uma, duas ou quatro colunas conforme o espaço. Mascote secundário e fundo sem cenário decorativo.

Cabeçalho com Início, Explorar, Meus guias (histórico), Sobre, ajuda, tema e conta. No celular, o menu contém navegação e controles secundários. O menu Texto e opções preserva tamanho da fonte, contraste, troca de aparelho e criação/edição de guias. Escape fecha menus e retorna o foco.

Os fluxos existentes de bancos, WhatsApp, governo, outros aplicativos, login e televisão foram preservados. Capturas existentes são exibidas inteiras, em sua proporção natural, com link para ampliação e aviso sobre diferenças entre versões. Não foram criadas imagens de aplicativos nem alterados dados remotos.

## Validação

- ESLint: aprovado, sem avisos.
- TypeScript estrito: aprovado.
- Vitest: 47 arquivos, 230 testes aprovados.
- Build de produção Next.js: aprovado.
- Navegador: larguras de 320, 430, 768, 1366 e 1920 pixels, sem overflow horizontal nem textos cortados nos cards.
- Conferidos tema claro/escuro, menu móvel, texto muito grande e alto contraste; corrigidos fundo do campo de busca e logo no alto contraste.
- Fluxo real conferido: busca por áudio → tarefa do WhatsApp → escolha de iPhone → leitor com captura existente e link de ampliação.
- Testes cobrem busca, ausência de resultados, sugestões, seleção de bancos/aplicativos, Escape e retorno do foco, contagem sem promover rascunhos e preservação da imagem.

O executável npm não estava disponível no PATH. Foram executados os mesmos programas dos scripts do package.json diretamente com Node: `node node_modules/eslint/bin/eslint.js .`, `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/vitest/vitest.mjs run` e `node node_modules/next/dist/bin/next build`. O runtime disponível é Node 24.19.0; o projeto declara Node 22.x.

## Limitações e pendências

- O catálogo atual contém demonstrações e conteúdos em preparação. A contagem não os apresenta como guias publicados prontos; algumas categorias mostram zero disponíveis. As tarefas existentes continuam acessíveis com seu estado indicado.
- Alguns textos remotos têm codificação anterior incorreta, por exemplo “Enviar um Ã¡udio”. Esta tarefa não corrigiu o banco nem modificou conteúdo remoto.
- A classificação das quatro novas categorias usa títulos e termos de busca existentes. Uma taxonomia editorial própria poderá melhorar a classificação futuramente.
- A navegação de login foi preservada e coberta pelos testes existentes; não foi feita autenticação com uma conta real nem envio à IA externa.
- A verificação responsiva usa o navegador disponível; não substitui testes em aparelhos físicos, leitores de tela e com pessoas idosas.
- As alterações locais anteriores foram preservadas. Não houve dependências novas, commit, push, deploy, migrations ou alteração de backend.

## Arquivos alterados nesta tarefa

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/features/search/home-search.tsx`
- `src/features/search/home-search.test.tsx`
- `src/features/theme/home-toolbar.tsx`
- `src/features/guides/screen-placeholder.tsx`
- `src/features/guides/screen-placeholder.test.tsx`
- `src/features/accessibility/accessibility-context.tsx` — restauração das preferências após a primeira pintura, com cancelamento ao desmontar.
- `src/features/device-picker/device-context.tsx` — mesma correção de hidratação das preferências.
- `src/features/ai/ask-guido-modal.tsx` — tipos de reconhecimento de voz, foco, Escape e encerramento do microfone ao fechar.
- `src/features/search/home-tv-search.tsx` — remoção de imports não utilizados.

Os quatro últimos arquivos já existiam localmente sem rastreamento no Git antes desta tarefa.

## Arquivos criados nesta tarefa

- `src/app/learning-home.css`
- `src/features/search/learning-home.tsx`
- `src/features/search/learning-catalog.ts`
- `src/features/search/learning-catalog.test.ts`
- `docs/REDESENHO_INICIO.md`
- `docs/screenshots/inicio-desktop.png`
- `docs/screenshots/inicio-mobile.png`

Outros arquivos que já constavam como modificados ou não rastreados no Git não foram descartados e não fazem parte das mudanças desta tarefa.
