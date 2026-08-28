# Device Platform Cues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Samsung and iPhone choices recognizable at a glance for older users by showing a clear Android or iOS cue inside each phone image while preserving the existing selection and routing behavior.

**Architecture:** Keep the existing `DevicePickerCard` and `TaskGuideSetup` flow. Add platform metadata to the two existing device definitions, render code-native inline platform icons as a non-interactive overlay inside each phone image, and retain the large device names and radio controls as the source of truth. Use CSS media rules to keep the cue inside the phone on desktop/tablet and compact it without overflow on narrow mobile layouts.

**Tech Stack:** Next.js, React, strict TypeScript, CSS in `src/app/globals.css`, Vitest and Testing Library.

## Global Constraints

- Reuse the existing phone images and `DevicePickerCard`; do not add dependencies or external images.
- Preserve `android`/`ios` values, local-storage persistence, keyboard radio navigation, and existing guide routes.
- Keep strict TypeScript; do not use `dangerouslySetInnerHTML` or weaken lint/type rules.
- Keep the cue decorative/non-interactive so the radio card remains the only selection target (`rule/control-matches-cardinality`).
- Provide an accessible name for each platform cue and retain a keyboard-completable radio flow (`rule/accessible-name-required`, `rule/keyboard-complete-flow`).
- Design the populated, selected, unselected, keyboard-focus, reduced-motion, and narrow-mobile states (`rule/cover-reachable-states`).
- Run the project-required lint, typecheck, test, build, and `git diff --check` before declaring the implementation complete.

---

## Product brief and decisions

- **User:** An older adult choosing which phone instructions to open; they may recognize a platform symbol faster than a phone silhouette.
- **Job:** Identify whether their phone uses Android or iOS before continuing to the guide.
- **Current behavior:** The selector shows a realistic Samsung and iPhone image plus text, but both screens are blank and the platform distinction is not immediately visible.
- **Desired outcome:** Each phone screen visibly carries a high-contrast platform cue: Android on Samsung and iOS on iPhone. The text “Samsung” and “iPhone” stays large below the image.
- **Success signal:** A user can distinguish the two choices without zooming or reading a long explanation; existing radio selection, keyboard arrows, and route query values remain unchanged.
- **Non-goals:** Do not add Samsung branding, change the device images, infer a user’s choice from the icon, alter guide content, or add a new selection step.
- **Object / action / consequence:** The object is the device option; selecting its existing radio changes only the chosen operating system and continues to the same guide route as before. The platform cue itself has no action.
- **Permissions:** No authentication or special permission is required.
- **Open decision:** Use a recognizable Android robot glyph and an Apple-style iOS glyph rendered inline in the existing codebase, with the visible text “Android”/“iOS” as a redundant cue. If brand artwork is later replaced by approved assets, only the icon component should change.

## Reachable states to cover

- Initial default: Samsung/Android selected; both cues visible.
- Unselected iPhone/iOS: cue remains visible with the neutral card style.
- Selected iPhone/iOS: cue remains visible while the card/check state changes.
- Keyboard focus and arrow navigation: the radio remains the focus target; cue never intercepts input.
- Disabled continuation: cue and selection remain understandable while “Continuar” is disabled.
- Narrow mobile (390px and 320px): cue stays within the phone/card bounds; its accessible name remains available even if the visible word is compacted.
- Reduced motion: no new animation is required; existing card transitions continue to honor `prefers-reduced-motion`.

### Task 1: Lock the platform cue contract with tests

**Files:**
- Modify: `src/features/guides/task-guide-setup.test.tsx`

**Interfaces:**
- Consumes: the existing `TaskGuideSetup` render fixture.
- Produces: assertions for the two platform cues and their stable accessible names.

- [ ] **Step 1: Add a failing assertion for both cues**

Extend the existing test that checks the two visible device radios:

```tsx
expect(screen.getByRole("img", { name: "Sistema Android" })).toBeVisible();
expect(screen.getByRole("img", { name: "Sistema iOS" })).toBeVisible();
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npm test -- src/features/guides/task-guide-setup.test.tsx
```

Expected: the existing radio assertions pass, but the new platform cue assertion fails because the cue is not rendered yet.

### Task 2: Render platform cues without changing selection behavior

**Files:**
- Modify: `src/features/guides/task-guide-setup.tsx:48-52`
- Modify: `src/features/guides/device-picker-card.tsx:17-21,78-112`

**Interfaces:**
- Consumes: `OperatingSystem`, the existing `Device` metadata, and the current `Image`/radio markup.
- Produces: a `platform` field on each device and a decorative `role="img"` cue named `Sistema Android` or `Sistema iOS` inside the image wrapper.

- [ ] **Step 1: Add explicit platform metadata to the two existing devices**

Extend the local device type with `platform: "android" | "ios"` and set:

```tsx
{ id: "samsung", name: "Samsung", os: "android", platform: "android", image: "/images/devices/samsung.png" },
{ id: "iphone", name: "iPhone", os: "ios", platform: "ios", image: "/images/devices/iphone.png" },
```

Pass that field through the `DevicePickerCard` device interface.

- [ ] **Step 2: Add a small inline `PlatformIcon` component**

Render only code-native SVG geometry for the Android robot and iOS/Apple-style cue. Each SVG must use `aria-hidden="true"`; the parent cue owns the accessible name. Do not load a CDN, add a package, or change the phone image files.

- [ ] **Step 3: Place the cue inside the phone image wrapper**

Keep the existing radio input, `Image`, selected check, and device name. Wrap the image in a positioned phone container and add:

```tsx
<span
  className={`device-platform-cue device-platform-cue--${device.platform}`}
  role="img"
  aria-label={`Sistema ${device.platform === "android" ? "Android" : "iOS"}`}
>
  <PlatformIcon platform={device.platform} />
  <span aria-hidden="true">{device.platform === "android" ? "Android" : "iOS"}</span>
</span>
```

The cue must have `pointer-events: none` so clicking anywhere in the label still activates the existing radio.

- [ ] **Step 4: Run lint and the focused test**

Run:

```bash
npx eslint src/features/guides/task-guide-setup.tsx src/features/guides/device-picker-card.tsx src/features/guides/task-guide-setup.test.tsx
npm test -- src/features/guides/task-guide-setup.test.tsx
```

Expected: lint passes and all device setup tests pass, including both new cue assertions.

### Task 3: Style the cue for recognition and responsive safety

**Files:**
- Modify: `src/app/globals.css:3387-3406` and the existing device-picker responsive blocks.

**Interfaces:**
- Consumes: `.device-picker-image-wrap`, `.device-picker-image`, and existing card breakpoints.
- Produces: a high-contrast overlay that remains inside the phone on wide screens and cannot overflow at 390px/320px.

- [ ] **Step 1: Make the image wrapper/phone container positioning explicit**

Use a relative inner phone container that follows the rendered image dimensions. Keep the current image `object-fit` and drop shadow unchanged.

- [ ] **Step 2: Style the desktop/tablet cue**

Use a compact dark translucent pill with a blue accent, a visible inline icon, and the text “Android”/“iOS”. Center it over the dark screen, keep it non-interactive, and ensure contrast against both phone images. Do not change card selection colors.

- [ ] **Step 3: Add mobile compaction rules**

At the existing 320px breakpoint, reduce the cue to an icon badge that stays within the smaller phone image; keep the accessible name and the large “Samsung”/“iPhone” label. Do not introduce horizontal overflow or change the one-column radio layout.

- [ ] **Step 4: Preserve reduced-motion behavior**

Do not add a new animation. Ensure existing image/card transforms remain the only motion and continue to be disabled by the existing `prefers-reduced-motion` rules.

- [ ] **Step 5: Run focused checks**

Run:

```bash
git diff --check
npm test -- src/features/guides/task-guide-setup.test.tsx
```

Expected: no whitespace errors and all focused tests pass.

### Task 4: Verify the complete selector and route contract

**Files:**
- Test: `src/features/guides/task-guide-setup.test.tsx`
- Test: `src/features/guides/device.test.ts`
- Test: `src/features/guides/guide-viewer.test.tsx`

**Interfaces:**
- Consumes: the unchanged `saveOperatingSystem`, route construction, and guide viewer contracts.
- Produces: evidence that the visual cue work did not alter platform persistence or navigation.

- [ ] **Step 1: Run the related guide test set**

```bash
npm test -- src/features/guides/task-guide-setup.test.tsx src/features/guides/device.test.ts src/features/guides/guide-viewer.test.tsx
```

Expected: all related tests pass, including Samsung/Android defaulting, iPhone/iOS selection, keyboard arrows, local-storage persistence, and route query assertions.

- [ ] **Step 2: Run the required project validation**

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

Expected: commands complete without new failures. Record any pre-existing warning separately; do not hide it by changing lint or TypeScript settings.

- [ ] **Step 3: Check the existing local server without restarting it**

```bash
curl -sS -o /tmp/guido-device-picker.html -w 'HTTP %{http_code}\n' http://127.0.0.1:3000/
```

Expected: HTTP 200 from the already-running `localhost:3000`; do not kill or restart any server.
