# Fluxo de tarefas pesquisadas Implementation Plan

**Goal:** Fazer cada tarefa identificada pela busca chegar à tela de escolha de celular com o nome correto da tarefa e do aplicativo, sem reaproveitar a rota fixa de “Pagar um boleto” nem exibir a tela genérica de tarefa depois da escolha do banco.

**Architecture:** A busca guardará o alvo identificado (ação ou tarefa) enquanto o usuário escolhe o banco. Depois da seleção, ela resolverá a tarefa equivalente para aquele aplicativo e navegará para `/tarefas/[slug]`, passando o aplicativo selecionado por query string apenas quando a tarefa for genérica. A página de tarefa exibirá o mesmo `TaskGuideSetup` para tarefas disponíveis e em preparação; somente tarefas não preparatórias habilitarão “Continuar”. O botão inicial “Bancos”, que não tem tarefa definida, continuará abrindo o seletor de tarefa.

**Tech Stack:** Next.js App Router, React 19, TypeScript estrito, Vitest, Testing Library e CSS existente.

## Global Constraints

- Alterar somente o fluxo da busca e da tela de preparação de tarefas; não tocar em `/explorar` ou em arquivos que pertençam ao outro chat.
- Não adicionar dependências.
- Não usar dados bancários reais, credenciais ou imagens pessoais.
- Não publicar guias em preparação como oficiais.
- Não fazer commit, push, deploy ou criar repositório remoto.

---

### Task 1: Preservar a tarefa da busca durante a escolha do banco

**Files:**
- Modify: `src/features/search/home-search.tsx`
- Test: `src/features/search/home-search.test.tsx`

**Interfaces:**
- Add `isBankTask(task: Task, applications: Application[]): boolean` to identify demo-bank and financial-application tasks.
- Add a pending search target containing either `Action` or `Task` while `BankModal` is open.
- Resolve an action target to the selected bank’s task with the same `actionId`; resolve generic demo tasks with `?app=<bank-slug>`.

- [ ] **Step 1: Write failing behavior tests**

Add tests that submit a bank-specific query such as `identificar golpe bancário`, select `Nubank`, and assert that the router receives the matching task route instead of opening `TaskModal`. Add a test that submits `pix`, selects `Caixa`, and asserts the route is `/tarefas/pix-caixa`. Keep the generic “Bancos” category test asserting that it still opens the task chooser because it has no task target.

- [ ] **Step 2: Run the focused tests and verify the new assertions fail**

Run: `npm test -- --run src/features/search/home-search.test.tsx`

Expected: the new route assertions fail because selecting a bank currently opens `TaskModal` and does not retain the search target.

- [ ] **Step 3: Implement the pending-target handoff**

Update `HomeSearch` so the search action stores `{ action: matchingAction }`, bank-task suggestions store `{ task }`, and matching non-bank tasks navigate directly to `/tarefas/${task.slug}`. On bank selection, resolve the selected bank task and navigate directly to that route; use `?app=<selected-bank-slug>` only for generic `app-demo-bancos` tasks that have no bank-specific equivalent. Keep `modalOriginRef` and focus restoration working for both category and search flows. Intercept clicks on bank-task suggestion links so they open the bank modal before navigation.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run: `npm test -- --run src/features/search/home-search.test.tsx`

Expected: all search tests pass, including the new dynamic task-route assertions.

---

### Task 2: Render the device-selection screen for every task with dynamic application context

**Files:**
- Modify: `src/app/tarefas/[slug]/page.tsx`
- Modify: `src/features/guides/task-guide-setup.tsx`
- Test: `src/features/guides/task-guide-setup.test.tsx`

**Interfaces:**
- Extend `TaskGuideSetupProps` with `selectedApplicationSlug?: string` and `canContinue?: boolean`.
- `TaskPage` accepts `searchParams?: Promise<{ app?: string | string[] }>` and resolves a requested application for generic demo tasks.

- [ ] **Step 1: Write failing setup tests**

Add a test that renders a task titled `Bloquear cartão` with `selectedApplicationSlug: "nubank"` and asserts the breadcrumb contains `Nubank` and `Bloquear cartão`. Add a test with `canContinue: false` that asserts the Continue button is disabled and the router is not called after a click.

- [ ] **Step 2: Run the focused setup tests and verify they fail**

Run: `npm test -- --run src/features/guides/task-guide-setup.test.tsx`

Expected: the selected application prop and disabled Continue behavior are not implemented yet.

- [ ] **Step 3: Implement dynamic setup context and preparation behavior**

In `TaskGuideSetup`, initialize the displayed application from `selectedApplicationSlug` when it exists in `applicationOptions`, keep `taskTitle` as the breadcrumb task name, and guard `openGuide` when `canContinue` is false. Pass the disabled state to `DevicePickerCard`. In `TaskPage`, resolve `searchParams.app` for generic demo tasks, pass the resolved application and bank options to `TaskGuideSetup`, and render `TaskGuideSetup` for both available/demo and preparing tasks. Set `canContinue` to `task.availability !== "preparing"`.

- [ ] **Step 4: Run the focused setup tests and verify they pass**

Run: `npm test -- --run src/features/guides/task-guide-setup.test.tsx`

Expected: all setup tests pass, including dynamic breadcrumb and disabled Continue behavior.

---

### Task 3: Make the disabled Continue state explicit and verify the full project

**Files:**
- Modify: `src/features/guides/device-picker-card.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Extend `DevicePickerCardProps` with `continueDisabled?: boolean`.

- [ ] **Step 1: Implement the button state**

Set the Continue button’s native `disabled` attribute from `continueDisabled` and add a CSS state that visibly communicates the unavailable action while preserving the existing enabled appearance for the validated demo task.

- [ ] **Step 2: Run the complete verification suite**

Run: `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`.

Expected: TypeScript, tests and build pass; lint may retain only the repository’s existing warnings in unrelated application-logo files. Confirm `curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:3010/` returns `200`.

- [ ] **Step 3: Run the UI quality detector**

Run: `node /home/eduardo/.agents/skills/impeccable/scripts/detect.mjs --json src/features/search/home-search.tsx src/features/guides/task-guide-setup.tsx src/features/guides/device-picker-card.tsx src/app/tarefas/[slug]/page.tsx src/app/globals.css`

Record any existing detector warnings without changing unrelated design systems.

No commit is created, per repository instructions.
