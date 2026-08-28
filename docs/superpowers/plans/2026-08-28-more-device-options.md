# More Device Options Implementation Plan

> **For agentic workers:** Execute this plan inline with small verification checkpoints. Do not commit, push, deploy, or add dependencies.

**Goal:** Expand the existing device selector with Moto G, LG, Xiaomi, and Realme while keeping platform cues, routing, selection, and responsive behavior intact.

**Architecture:** Extend the shared `deviceOptions` data source used by both the setup page and the switcher modal. Reuse the existing inline Android/iOS cue component and representative local phone assets; tune the shared grid for six options at desktop, tablet, and mobile widths.

**Tech Stack:** Next.js, React, strict TypeScript, CSS modules via `src/app/globals.css`, Vitest Testing Library.

## Global Constraints

- Keep only local assets and inline SVG; do not add dependencies or external images.
- Preserve the existing `os` query parameter, localStorage preference, keyboard navigation, and guide routes.
- Keep the selector accessible with named radios, visible focus, and no duplicate implementation.
- Do not perform destructive operations or create commits, pushes, or deployments.

### Task 1: Extend shared device data and rendering

**Files:**
- Modify: `src/features/guides/device-options.ts`
- Modify: `src/features/guides/device-picker-card.tsx`

- [ ] Add the four Android options (`moto-g`, `lg`, `xiaomi`, `realme`) to `deviceOptions`, using the existing local Android phone image as the platform representative until model-specific assets exist.
- [ ] Keep the existing inline Android cue for Android models and iOS cue for iPhone; make the option-grid class distinguish the six-option layout without changing the component API used by routes.

### Task 2: Make the six-option layout responsive

**Files:**
- Modify: `src/app/globals.css`

- [ ] Use three columns on wide screens, two columns on compact screens, and one column on very narrow screens; keep cards within the viewport width and preserve 44px-or-larger controls.
- [ ] Compact only the extended six-option cards so the modal remains usable without changing the two-option visual treatment elsewhere.

### Task 3: Verify selection and platform cues

**Files:**
- Modify: `src/features/guides/task-guide-setup.test.tsx`

- [ ] Assert all six labels are present, five Android cues and one iOS cue render, and selecting a new Android model still continues with `os=android`.
- [ ] Run focused tests, lint, typecheck, full tests, build, and `git diff --check`.
