# Busca inteligente da Home — Plano de implementação

**Objetivo:** Tornar a busca da Home tolerante a acentos, variações, erros curtos e termos relacionados, mantendo o input original, as rotas e o layout atual.

**Arquitetura:** A normalização e o ranking permanecem centralizados em `src/features/search/search-content.ts`. O ranking aceitará documentos com título, aliases e descrição para priorizar correspondências fortes; strings simples continuarão suportadas para não quebrar consumidores existentes. `HomeSearch` usará os dados atuais de tarefas, ações e aplicativos, incluindo o nome do aplicativo no texto pesquisável, e exibirá no máximo quatro sugestões relevantes.

**Restrições:** Sem dependências novas, sem dados fictícios, sem segunda implementação de busca, sem alteração de header/robô/layout geral, sem `dangerouslySetInnerHTML`, sem commit/push/deploy e preservando as mudanças não relacionadas já presentes no worktree.

### Tarefa 1 — Normalização, distância leve e ranking

**Arquivos:** `src/features/search/search-content.ts`, `src/features/search/search-content.test.ts`

- Normalizar pontuação como separadores, espaços duplicados, maiúsculas e acentos sem modificar o texto exibido no input.
- Implementar distância de Levenshtein pequena, aplicando fuzzy somente a tokens com pelo menos três caracteres, limite proporcional curto e sem aceitar palavras sem relação.
- Adicionar `SearchDocument` opcional a `rankSearch`, preservando a assinatura textual existente.
- Pontuar na ordem: frase/título exato, início do título, alias exato, título/alias contendo a consulta, tokens fuzzy e descrição.
- Cobrir `boleto`, `boleta`, `boletoo`, `cartao/cartão`, `comprovamte`, `sando`, `watsapp/whats`, `recibo`, `senha`, `gov`, `audio`, `ligacao`, `golpe`, `pix` e rejeitar `dinossauro`.

### Tarefa 2 — Integrar a busca da Home aos documentos reais

**Arquivos:** `src/features/search/home-search.tsx`, `src/data/actions.ts` (somente aliases ausentes e confirmados, se necessário)

- Construir documentos de busca com título, descrição, `searchTerms` e nome do aplicativo, evitando duplicatas de sugestões equivalentes.
- Remover a aleatoriedade das sugestões durante a digitação para respeitar o ranking; manter o comportamento de categorias quando o campo está vazio.
- Preservar a busca enviada, o modal de bancos, `returnTo` e as rotas atuais.
- Manter o valor digitado intacto; links das sugestões continuam navegando ou abrindo o modal existente conforme o tipo da tarefa.
- Mostrar a mensagem “Não encontramos esse guia.” e “Tente escrever de outra forma.” quando não houver correspondência razoável.

### Tarefa 3 — Verificação

- Rodar os testes focados de busca, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` e `git diff --check`.
- Conferir visualmente a Home em desktop e mobile, verificando que nenhuma alteração de layout ou overflow foi introduzida.
- Rodar o detector do Impeccable uma vez nos arquivos de busca e registrar avisos preexistentes.
