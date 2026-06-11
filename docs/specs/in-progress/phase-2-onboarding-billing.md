# Phase 2 — Trainer Onboarding + Billing

**Status:** In progress
**Active checkpoint:** CP0 — Color reskin

## Checkpoint 0 — Color reskin ✅ Complete

- [x] Tokens updated in globals.css (charcoal + burnt orange)
- [x] All screens visually updated
- [x] Build passes (zero TypeScript errors)
- [x] PRD section 15 updated

**Scope:** Pure token + Tailwind class replacement. No layout, spacing, or logic changes.

---

## Checkpoint 0b — Brighter orange + glow + native polish ✅ Complete

Direction shift from flat/minimal to bold papaya-glow. Supersedes CP0's
burnt orange and the PRD's old "no gradients/animations" aesthetic.

- [x] **Part 1** — Primary `#C05C28 → #FF6400` (hover `#E55A00`), new
  `--primary-glow` token + glow utilities (`.glow-orange*`). Warning family
  re-warmed (`#FFF2E8 / #FFD2B0 / #B34700`). All old-orange hex swapped
  app-wide. Glow applied to: primary CTAs, badges, trainer avatar, active
  bottom-nav icon, escalation status dots. PRD §15.1 + §15.3 rewritten.
- [x] **Part 2** — Dashboard mobile layout: dark gradient header
  (`160deg #1C1C1C → #2A1800`) with greeting + frosted bell + glowing
  avatar + 3 stat tiles; dark escalation card (`#1C1C1C`, orange left
  border, glowing dot, orange-tint client rows, glowing Reply); white
  check-in cards with orange overdue timestamps + glowing Remind. Desktop
  layout preserved.
- [x] **Part 3** — Animated pre-login `/welcome` route (CSS keyframes,
  Framer Motion not installed). Staged entrance logo→wordmark→tagline→CTAs,
  respects `prefers-reduced-motion`. `proxy.ts` + `AuthGuard` now land
  logged-out users on `/welcome`.
- [x] **Part 4** — Unified native icon + splash from one source
  (`scripts/gen-icons.mjs` → `assets/` → `@capacitor/assets`). Identical
  rectangle-"F" on both platforms (permanent fix for the old mismatch).
  Splash bg `#1C1C1C`, `launchShowDuration` 1500, status bar charcoal.
  PWA `public/icon-512.png` + `icon-192.png` generated.
- [x] Build passes (web + mobile), `cap sync` clean both platforms
- [x] `/welcome` verified in browser (no console errors)

**Routing note:** welcome screen is a top-level `/welcome` route (outside the
`(auth)` card layout). Public in both `proxy.ts` and `AuthGuard`.

**Known cosmetic gap:** the sub-second *native* pre-splash glyph still
differs slightly (iOS storyboard uses Futura-Bold; Android 12 uses the
rectangle-F foreground). App icon + Capacitor plugin splash are pixel-
identical. Final logo to come from the designer.

---

## Checkpoints 1-4 (not yet scoped)

Placeholder for upcoming milestones. Full spec to be added after CP0 ships.
