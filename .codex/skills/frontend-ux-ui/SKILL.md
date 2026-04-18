---
name: frontend-ux-ui
description: Design and refine frontend UX/UI for this repository's Next.js application. Use when Codex needs to improve or create screens, flows, forms, dashboards, menus, cards, navigation, loading/empty/error states, responsive behavior, visual hierarchy, or product microcopy in React/TSX, Tailwind, shadcn/base UI, or shared app styling files.
---

# Frontend UX/UI

Design interfaces that feel intentional, calm, and operationally clear for hotel guests and staff.

Preserve the product's current visual language instead of forcing a new one. This repo already uses App Router, shared page-shell patterns, package-level UI primitives, Tailwind v4 tokens, and a lilac/plum theme in `apps/nextjs/src/app/globals.css`.

## Workflow

1. Define the job of the screen before changing layout.
   Capture the primary actor, the primary task, the main decision, and the success state in 1-2 sentences.

2. Audit the current experience.
   Identify what is unclear, slow, noisy, or visually flat.
   Check hierarchy, CTA prominence, scanability, state coverage, and mobile behavior.

3. Choose the smallest useful intervention.
   Prefer one of these paths:
   - polish an existing screen without changing structure
   - reorganize information architecture on one screen
   - redesign a flow with clearer steps and feedback

4. Sketch the interaction model in code terms before editing.
   Decide:
   - what the headline promise is
   - which action is primary
   - which data deserves summary cards versus detailed lists
   - which controls must stay visible on mobile
   - which empty/loading/error states need custom treatment

5. Implement with the repo's primitives first.
   Reuse `packages/ui` components and existing app-level shells like `PageShell`, `SectionHeader`, navigation, badges, cards, and drawers before inventing new patterns.

6. Verify clarity after implementation.
   Read the screen top to bottom and confirm a first-time user can answer:
   - where am I
   - what matters most right now
   - what can I do next
   - what changed after I acted

## Repo-Specific Rules

- Preserve named exports and the existing TypeScript/React structure.
- Respect TDD for behavior changes. Add or update tests before implementing new state logic, branching rules, or interaction behavior.
- Keep Tailwind class lists readable and token-driven. Prefer theme tokens from `globals.css` over hard-coded ad hoc colors.
- Preserve the established atmosphere: soft gradients, rounded surfaces, elevated cards, and clear operational emphasis.
- Prefer composition over adding many new abstractions for one screen.
- Keep copy concise and task-led. Staff screens should sound operational and confident. Guest screens should sound reassuring and low-friction.

## Layout Heuristics

- Make one thing dominant per viewport.
- Group dense data into sections with visible headings.
- Use summary cards for totals, counts, and status snapshots.
- Use drawers, sheets, or secondary panels for drill-down instead of overloading the main list.
- Keep destructive or rare actions visually quieter than the primary flow.
- On mobile, stack content in the order of urgency, not desktop symmetry.

## State Design

Always design these states explicitly when relevant:

- loading
- empty
- error
- unauthorized or blocked
- optimistic or pending action
- success confirmation

Do not leave these as generic leftovers if the screen is important to task completion.

## Visual Direction

- Start from the existing tokens in `apps/nextjs/src/app/globals.css`.
- Use `bg-card`, `text-muted-foreground`, `border-primary/15`, and similar semantic styling before custom values.
- Use contrast and spacing to create hierarchy before adding more color.
- Let accents guide attention, not paint the whole page.
- Prefer 1-2 strong densities on a screen instead of mixing many competing card sizes.

## Interaction Copy

Write labels and helper text that answer intent quickly:

- Use verbs for actions.
- Name the outcome, not the implementation.
- Replace vague labels like "Submit" or "Manage" with specific actions.
- Explain blocked states with the next best action.
- For operational dashboards, make timestamps, counts, and status meaning obvious at a glance.

## Implementation Notes

- For new screens, begin with the page shell and section header, then build the main task area.
- For dashboards, separate summary metrics from live work queues.
- For forms, keep field groups short and pair them with inline help or examples when the format is not obvious.
- For list/detail experiences, make selection state obvious and keep detail context anchored.
- For responsive work, validate the narrowest layout first, then widen progressively.

## References

- Read [references/review-checklist.md](./references/review-checklist.md) when you need a sharper critique pass before or after implementation.
