# Home Guido — Reference Redesign Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with verification checkpoints. Do not commit, push, deploy, kill development servers, or remove user files.

**Goal:** Recompose the Guido home around the reference image's fast task discovery flow while preserving existing search, category modals, routes, themes, and responsive behavior.

**Architecture:** Keep `src/app/page.tsx` as the server-side catalog boundary and `src/features/search/home-search.tsx` as the client-side interaction surface. Reuse `HomeToolbar`, `ApplicationLogo`, current data and route helpers; limit the visual changes to the home header, hero, search suggestions, category cards and their scoped CSS.

**Tech Stack:** Next.js App Router, React/TypeScript, existing CSS tokens, Vitest + Testing Library, local browser at `localhost:3010`.

## Global Constraints

- Preserve current GET/search behavior, category selection, bank/task modals, authentication and navigation routes.
- Reuse existing mascot, background, logo and application assets; do not add dependencies, remote images or fake data.
- Do not use `dangerouslySetInnerHTML`, weaken TypeScript strictness, kill all servers, or edit unrelated dirty files.
- Keep cards as a single interactive element with no nested links or buttons.
- Validate with `npm run lint`, `npm run typecheck`, `npm test`, `npm run build -- --webpack`, route curl and `git diff --check`.

---

### Task 1: Lock the home interaction contract before visual edits

**Files:**
- Modify: `src/features/search/home-search.tsx`
- Create or modify: `src/features/search/home-search.test.tsx`

**Interfaces:**
- Keep `HomeSearch({ applications, tasks })` and all existing modal/navigation callbacks.
- Add three deterministic quick-query controls: `Pix`, `boleto`, and `recuperar senha`.

- [ ] Add tests that the new title/subtitle and placeholder render, quick-query controls are buttons, and clicking `Pix` fills the existing searchbox without navigating or opening a modal.
- [ ] Run `npm test -- src/features/search/home-search.test.tsx` and confirm the new test fails before implementation if the behavior is absent.
- [ ] Add an input ref and a `quickQueries` constant; clicking a quick-query button calls `setQuery(value)`, clears `submittedQuery`, and returns focus to the searchbox.
- [ ] Change only the home copy to `O que você precisa fazer?` with a separately styled `fazer?` span and subtitle `Encontre ajuda passo a passo para resolver tarefas do dia a dia.`.
- [ ] Change the search placeholder to `Digite: Pix, boleto, senha...` while preserving the current submit ranking, bank modal and task routing.
- [ ] Run the targeted test file and verify all existing search/modal tests still pass.

### Task 2: Recompose the home header without breaking shared pages

**Files:**
- Modify: `src/features/theme/home-toolbar.tsx`
- Modify: `src/features/search/home-search.tsx` only if a home-only class/prop is required
- Test: existing toolbar/search tests, if present

**Interfaces:**
- Preserve `HomeToolbar({ activePage, showAdmin })` and the “Sobre” help dialog for non-home contexts.
- Render the home navigation as `Explorar`, `Enviar print`, theme toggle and `Entrar`; internal pages keep their current navigation unless a home-only prop is added.

- [ ] Add a `homeOnly` prop only if the shared toolbar cannot distinguish the home route safely; default it to the current behavior for all callers.
- [ ] On the home, omit only the redundant “Início” and “Sobre” navigation items while keeping the theme button, login/account menu and keyboard focus behavior.
- [ ] Ensure the header uses no overflow-prone fixed widths at 1024px, 390px or 320px.
- [ ] Run the relevant tests and `npm run typecheck`.

### Task 3: Build the reference composition with existing assets

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/features/search/home-search.tsx` only for semantic wrappers/classes

**Interfaces:**
- Keep the existing `home-hero`, `home-hero-copy`, `home-mascot`, `home-category-grid` and search interaction contracts.

- [ ] Create a two-column desktop hero: copy/search/categories on the left and the current mascot/background on the right.
- [ ] Style the title accent, search field, circular blue submit affordance, quick-query row and category heading using existing `--home-*` tokens.
- [ ] Make the three category cards visually equivalent in their idle state; use larger icon/logo containers and preserve the existing category selection behavior.
- [ ] Use labels and descriptions: `Bancos — Pix, boleto e cartão`, `WhatsApp — Mensagens e chamadas`, and `Gov.br — Conta e serviços`.
- [ ] Keep each category card as one button, without nested controls; preserve focus-visible, hover and active states and remove any default Gov.br selection styling.
- [ ] Add `home-category-card--banks`, `home-category-card--whatsapp` or equivalent modifier classes only if needed to style existing icon wrappers without changing data contracts.
- [ ] Keep the mascot behind the content layer, constrain its size, and use existing light/dark mascot assets.

### Task 4: Harden responsive layout, themes and accessibility

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/features/search/home-search.tsx` only if attributes are missing

- [ ] At 1440px/1280px, verify the hero, search, suggestions and three cards appear before the mascot without excessive empty space.
- [ ] At 1024px, use a safe two-column category grid or a controlled fallback with no overlap.
- [ ] At 390px and 320px, stack the hero, keep the search inside the viewport, make the category cards one column, and prevent header clipping.
- [ ] Verify `role="search"`, the associated label, `aria-busy`, modal focus restoration, card/button names and visible keyboard focus.
- [ ] Preserve light/dark contrast and add reduced-motion overrides for newly introduced transforms/transitions.
- [ ] Run `node /home/eduardo/.agents/skills/impeccable/scripts/detect.mjs --json --scope layout src/app/page.tsx src/features/search/home-search.tsx src/features/theme/home-toolbar.tsx src/app/globals.css` once after UI edits; explain or correct every finding.

### Task 5: Final verification and handoff

**Files:**
- No new implementation files; review only the files touched above.

- [ ] Run `npm run lint` and record any pre-existing warnings without introducing new ones.
- [ ] Run `npm run typecheck`.
- [ ] Run the full `npm test` suite.
- [ ] Run `npm run build -- --webpack`.
- [ ] Run `curl -sS -o /tmp/guido-home.html -w 'HTTP %{http_code}\\n' http://127.0.0.1:3010/` and expect HTTP 200.
- [ ] Run `git diff --check` and `git status --short`; preserve unrelated changes and do not commit, push or deploy.

## Acceptance Checklist

- [ ] Home says `O que você precisa fazer?` and makes the search the primary action.
- [ ] Quick queries work without changing the existing search routing.
- [ ] Bancos, WhatsApp and Gov.br cards look intentional, equal by default and are fully clickable.
- [ ] Mascot and current background remain the visual signature.
- [ ] Desktop, tablet, mobile, light theme, dark theme, keyboard and reduced motion are verified.
- [ ] No functionality or unrelated worktree changes are lost.
