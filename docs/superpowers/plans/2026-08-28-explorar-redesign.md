# Redesign da página Explorar — Implementation Plan

> **Para agentes de implementação:** use o subfluxo de execução de planos disponível no projeto e implemente cada tarefa em ordem. Os passos usam caixas de seleção para acompanhamento.

**Objetivo:** transformar `/explorar` em uma biblioteca de guias mais clara, calma e escaneável, mantendo a busca, os filtros, o agrupamento de ações financeiras e os links existentes.

**Arquitetura:** manter `src/app/explorar/page.tsx` como composição server-side e preservar `src/features/explore/explore-content.ts` como fonte das regras de catálogo, filtragem e ordenação. Extrair o card visual para um componente próprio com variantes `featured` e `standard`; concentrar a nova hierarquia, ritmo e responsividade em estilos escopados por `.guido-explore` dentro de `src/app/globals.css`.

**Tech Stack:** Next.js App Router, React/TypeScript, CSS existente, Vitest + Testing Library, navegador local em `localhost:3010`.

## Restrições globais

- Preservar os parâmetros GET `q` e `categoria`, os hrefs `/acoes/...`, `/tarefas/...` e a lógica de agrupamento existente.
- Não adicionar dependências nem imagens novas; reutilizar logos e o cenário já presentes no projeto.
- Não usar dados bancários reais, credenciais, `dangerouslySetInnerHTML` ou relaxar o TypeScript estrito.
- Não fazer commit, push, deploy ou apagar arquivos.
- Ao concluir, executar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.

## Diagnóstico visual a resolver

- O hero ocupa muito espaço horizontal vazio à direita, enquanto a busca e os filtros ficam comprimidos no lado esquerdo.
- “Em destaque” pode renderizar um único card estreito, deixando dois terços da linha vazios.
- Os cards de “Todos os guias” têm hierarquia fraca: badge, aplicativo, título e status parecem textos soltos e o rodapé fica distante.
- Os cards não comunicam bem a diferença entre guia disponível, demonstração e conteúdo em preparação.
- A navegação funciona, mas precisa de foco visível, áreas de toque consistentes, melhor composição em 1024px/390px e contraste explícito nos dois temas.

---

### Tarefa 1: Fixar o contrato de apresentação dos cards

**Arquivos:**
- Criar: `src/features/explore/explore-guide-card.tsx`
- Criar: `src/features/explore/explore-guide-card.test.tsx`
- Modificar: `src/app/explorar/page.tsx:28-51, 116-132`
- Testar: `src/features/explore/explore-content.test.ts`

**Interfaces:**
- Consome `ExploreGuideItem` e `getExploreGuideHref` de `src/features/explore/explore-content.ts`.
- Produz `ExploreGuideCard({ item, variant?: "featured" | "standard" })`, renderizando um único `<Link>` por card.

- [ ] **Passo 1: escrever os testes do componente.** Verificar que o card padrão mostra categoria, aplicativo, título, descrição e status correto; que o card destacado recebe a classe `explore-guide-card--featured`; e que o href é o retorno de `getExploreGuideHref(item)`.

```tsx
it("renderiza o card padrão com status e destino do item", () => {
  render(<ExploreGuideCard item={item} />);
  expect(screen.getByRole("link", { name: /fazer pix/i })).toHaveAttribute("href", "/acoes/pix");
  expect(screen.getByText("Escolha o aplicativo")).toBeVisible();
});

it("aplica a variante destacada sem criar um segundo link", () => {
  render(<ExploreGuideCard item={item} variant="featured" />);
  expect(screen.getByRole("link")).toHaveClass("explore-guide-card--featured");
  expect(screen.getAllByRole("link")).toHaveLength(1);
});
```

- [ ] **Passo 2: rodar os testes para confirmar a falha.**

Run: `npm test -- src/features/explore/explore-guide-card.test.tsx`

Expected: FAIL porque o componente ainda não existe.

- [ ] **Passo 3: implementar o componente mínimo.** Organizar o markup em topo (badge + aplicativo), cópia (título + descrição) e rodapé (status + seta). Reutilizar `ApplicationLogo` apenas dentro de um wrapper quando houver espaço na variante destacada; manter o link inteiro como alvo de toque.

```tsx
import Link from "next/link";
import { ApplicationLogo } from "@/features/applications/application-logo";
import { getExploreGuideHref, type ExploreGuideItem } from "./explore-content";

export type ExploreGuideCardVariant = "featured" | "standard";

interface ExploreGuideCardProps {
  item: ExploreGuideItem;
  variant?: ExploreGuideCardVariant;
}

export function ExploreGuideCard({ item, variant = "standard" }: ExploreGuideCardProps) {
  const available = item.task.availability !== "preparing";
  const title = item.action?.taskTitle ?? item.task.title;
  const description = item.action?.description ?? item.task.description;
  const status = item.action
    ? "Escolha o aplicativo"
    : item.task.availability === "demo"
      ? "Demonstração disponível"
      : available ? "Guia disponível" : "Guia em preparação";

  return (
    <Link
      href={getExploreGuideHref(item)}
      className={`explore-guide-card${variant === "featured" ? " explore-guide-card--featured" : ""}`}
    >
      {variant === "featured" && (
        <span className="explore-card-app-mark"><ApplicationLogo application={item.application} /></span>
      )}
      <span className="explore-card-badge">{item.action ? "Serviços financeiros" : item.application.category}</span>
      <span className="explore-card-app">{item.action ? "Escolha seu banco" : item.application.name}</span>
      <div className="explore-card-copy">
        <h3>{title}</h3>
        <span className="explore-card-description">{description}</span>
      </div>
      <div className="explore-card-footer">
        <span className={`explore-card-status ${item.action || available ? "is-available" : "is-preparing"}`}>{status}</span>
        <span aria-hidden="true" className="explore-card-arrow">→</span>
      </div>
    </Link>
  );
}
```

- [ ] **Passo 4: substituir o `GuideCard` local da página pelo componente novo.** Mapear `popular` com `variant="featured"` e `visibleItems` com `variant="standard"`; remover o markup duplicado da página.
- [ ] **Passo 5: rodar o teste do componente e a suíte de exploração.**

Run: `npm test -- src/features/explore/explore-guide-card.test.tsx src/features/explore/explore-content.test.ts`

Expected: todos os testes PASS e nenhuma mudança nos hrefs ou agrupamentos existentes.

---

### Tarefa 2: Recompor hero, busca e filtros

**Arquivos:**
- Modificar: `src/app/explorar/page.tsx:78-108`
- Modificar: `src/app/globals.css:2086-2208`
- Testar: criar `src/app/explorar/page.test.tsx` se o harness atual permitir renderizar a página server-side; caso contrário, cobrir o markup pelo componente de apresentação da Tarefa 1.

**Interfaces:**
- Mantém `searchParams: Promise<{ q?: string; categoria?: string }>` e `categoryHref(category, query)`.
- Acrescenta apenas um link condicional “Limpar pesquisa e filtros” quando `q` ou `categoria` estiverem ativos; o link aponta para `/explorar`.

- [ ] **Passo 1: adicionar um teste de estado filtrado.** Confirmar que o input conserva `defaultValue={q}`, o filtro de categoria continua em hidden dentro do formulário e o link de limpeza só aparece quando há busca/filtro.
- [ ] **Passo 2: reorganizar o markup em uma seção hero sem mudar o conteúdo.** Envolver introdução, busca e filtros em `.explore-hero`; manter `<form role="search">`, label associada ao input, botão submit nativo e `aria-current="page"` nos filtros ativos.
- [ ] **Passo 3: aplicar a nova composição desktop.** Usar uma largura de leitura controlada para o texto (`max-width: 46rem`), uma busca mais larga (`max-width: 58rem`) e um contêiner geral de aproximadamente `78rem`, reduzindo o vazio à direita sem remover o cenário de fundo.
- [ ] **Passo 4: reforçar a hierarquia visual da busca.** Manter o ícone SVG existente, dar ao input uma área mínima de 4rem, ampliar o botão “Pesquisar” para alvo mínimo de 44px e adicionar estado `:focus-within` com contraste claro.
- [ ] **Passo 5: ajustar filtros.** Em telas largas, permitir quebra controlada (`flex-wrap`) e, em telas estreitas, manter rolagem horizontal sem cortar o foco; o chip ativo deve continuar preenchido com `var(--home-blue)`.
- [ ] **Passo 6: rodar lint e testes direcionados.**

Run: `npm run lint && npm test -- src/features/explore/explore-content.test.ts`

Expected: zero erros; os dois avisos antigos do lint podem permanecer documentados.

---

### Tarefa 3: Transformar “Em destaque” em um destaque de verdade

**Arquivos:**
- Modificar: `src/app/explorar/page.tsx:110-122`
- Modificar: `src/app/globals.css:2210-2330`
- Testar: `src/features/explore/explore-guide-card.test.tsx`

**Interfaces:**
- Consome o array `popular` já selecionado por `selectPopularItems`/`groupFinancialExploreItems`.
- Produz uma seção que funciona com 1, 2 ou até 6 itens sem deixar um card isolado perdido na grade.

- [ ] **Passo 1: escrever o caso de um único destaque.** Renderizar um item e verificar que o card usa a variante destacada e ocupa a largura total do bloco.
- [ ] **Passo 2: ajustar a seção.** Usar `.explore-featured-grid` (ou manter `.explore-popular-grid` com a variante) e preservar os textos condicionais “Mais acessados”/“Em destaque” e suas descrições.
- [ ] **Passo 3: estilizar a variante destacada.** Criar um painel horizontal com três áreas: identidade do aplicativo, título/descrição e CTA/status. Em desktop o painel deve ocupar `grid-column: 1 / -1`; em 2/1 colunas deve refluír sem overflow.
- [ ] **Passo 4: dar mais evidência ao estado disponível.** Usar uma faixa/ícone de status acessível, sem depender apenas de cor; manter “Escolha o aplicativo”, “Demonstração disponível” e “Guia em preparação” como textos reais.
- [ ] **Passo 5: validar o caso atual das imagens.** Abrir `/explorar` sem query e confirmar que um único destaque não deixa duas colunas vazias.

---

### Tarefa 4: Redesenhar os cards de “Todos os guias”

**Arquivos:**
- Modificar: `src/features/explore/explore-guide-card.tsx`
- Modificar: `src/app/globals.css:2243-2388`
- Testar: `src/features/explore/explore-guide-card.test.tsx`

**Interfaces:**
- Não modifica o contrato de `ExploreGuideItem`; somente melhora a apresentação e os estados.

- [ ] **Passo 1: criar a hierarquia interna do card.** Aplicar ordem visual fixa: badge de categoria → aplicativo → título → descrição → rodapé com status e seta.
- [ ] **Passo 2: equalizar a altura sem criar espaço morto excessivo.** Usar `display: flex`, `flex-direction: column`, `min-height` consistente e `margin-top: auto` apenas no rodapé; limitar descrições visualmente sem truncar texto acessível.
- [ ] **Passo 3: diferenciar estados.** Definir tokens de cor para disponível, demonstração e preparação nos temas claro/escuro; não usar só borda ou cor para comunicar disponibilidade.
- [ ] **Passo 4: melhorar interação.** Fazer o card inteiro ser um alvo de toque mínimo de 44px, adicionar `:focus-visible` evidente, hover discreto e `prefers-reduced-motion` sem deslocamento.
- [ ] **Passo 5: manter a grade previsível.** Usar 3 colunas em desktop, 2 até `62rem` e 1 até `42rem`; preservar a ordem alfabética já produzida pela função de catálogo.
- [ ] **Passo 6: rodar testes de regressão de href/status.**

Run: `npm test -- src/features/explore/explore-guide-card.test.tsx src/features/explore/explore-content.test.ts`

Expected: todos os destinos e textos de status continuam corretos.

---

### Tarefa 5: Responsividade, acessibilidade e acabamento dos dois temas

**Arquivos:**
- Modificar: `src/app/globals.css:1564-2520`
- Modificar: `src/app/explorar/page.tsx:78-145` apenas se uma classe/atributo de acessibilidade faltar
- Testar: `src/features/explore/explore-guide-card.test.tsx` e teste da página/composição criado na Tarefa 2

- [ ] **Passo 1: verificar desktop 1366×768.** O hero deve mostrar título, busca e filtros sem sobrepor a navegação; o primeiro destaque deve aparecer antes de um vazio excessivo.
- [ ] **Passo 2: verificar tablet 1024px.** A grade deve cair para duas colunas, os headings devem empilhar quando necessário e o botão de pesquisa não pode sair do campo.
- [ ] **Passo 3: verificar mobile 390px e 320px.** A busca deve empilhar input/botão, filtros devem ser roláveis com foco visível, cards devem ter uma coluna e nenhum texto pode ultrapassar o contêiner.
- [ ] **Passo 4: conferir teclado e leitor de tela.** Confirmar label do input, `role="search"`, `aria-current`, um único link por card, foco visível e status textual legível sem depender da cor.
- [ ] **Passo 5: conferir claro/escuro e movimento reduzido.** Verificar contraste dos textos secundários, chips, status e foco nos dois temas e manter transições desativadas ou reduzidas quando `prefers-reduced-motion: reduce` estiver ativo.
- [ ] **Passo 6: rodar o detector mecânico da interface.**

Run: `node /home/eduardo/.agents/skills/impeccable/scripts/detect.mjs --json --scope layout src/app/explorar/page.tsx src/features/explore/explore-guide-card.tsx src/app/globals.css`

Expected: `[]` ou findings individualmente explicados e corrigidos antes da entrega.

---

### Tarefa 6: Verificação final e entrega local

**Arquivos:**
- Nenhum arquivo novo; apenas confirmar o estado final dos arquivos das tarefas anteriores.

- [ ] **Passo 1: rodar lint.**

Run: `npm run lint`

Expected: exit 0; registrar os avisos preexistentes sem introduzir novos.

- [ ] **Passo 2: rodar typecheck.**

Run: `npm run typecheck`

Expected: exit 0.

- [ ] **Passo 3: rodar toda a suíte.**

Run: `npm test`

Expected: todos os arquivos e testes PASS.

- [ ] **Passo 4: rodar build.**

Run: `npm run build -- --webpack`

Expected: build de produção concluído com exit 0; usar cópia temporária se o `.next` estiver ocupado pelo servidor de desenvolvimento.

- [ ] **Passo 5: conferir a rota local.**

Run: `curl -sS -o /tmp/guido-explorar.html -w 'HTTP %{http_code}\\n' http://127.0.0.1:3010/explorar`

Expected: `HTTP 200`.

- [ ] **Passo 6: revisar `git diff --check` e o status.** Não fazer commit, push ou deploy; relatar arquivos alterados, avisos, limitações e o resultado visual nos três viewports.

## Checklist de aceite

- [ ] A página continua reconhecendo busca, categoria, agrupamento financeiro e estados vazios.
- [ ] O hero ocupa melhor a largura disponível e a tarefa principal (pesquisar/escolher) é evidente em poucos segundos.
- [ ] Um único item em “Em destaque” vira um painel intencional, não uma coluna solitária.
- [ ] Cards comuns têm hierarquia, status e CTA compreensíveis e áreas de toque/foco adequadas.
- [ ] Desktop, tablet, mobile, claro, escuro e movimento reduzido foram verificados.
- [ ] Lint, typecheck, testes, build, detector e rota local foram executados com evidência.
