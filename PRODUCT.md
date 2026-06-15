# Product

## Register

product

## Users

Two overlapping audiences share one app through scoped, role-gated access
(RBAC: `ADMIN | MANAGER | TEAM_MEMBER | CLIENT | HR`):

- **HR & admin operators** who run the people side of the business all day —
  attendance, leaves, holidays, daily reports, events, and the projects/expenses
  that touch payroll. They are power users on desktop, in the tool for long
  stretches, and they value speed and density over hand-holding.
- **Employees self-serving** their own slice — applying for leave, marking
  attendance, reading the holiday calendar, filing a daily report. They drop in
  briefly and infrequently, so the interface must stay legible and self-explaining
  without slowing the operators down.

Context of use: an authenticated portal (sidebar + top bar) with an HR area
(`/hr`) and an admin area (`/admin`). The user is almost always mid-task — apply a
leave, approve a leave, check who's in today — not browsing.

## Product Purpose

Zynetz HRMS (`crm-fe-hrms`) is the HR-focused frontend of the Zynetz enterprise
platform: a React 19 + Vite + Tailwind v4 + shadcn surface over the shared `crm-be`
API. It covers the people backbone of a services business — attendance, leaves,
holidays, daily reports, events — alongside the project/expense context HR needs,
and shares its auth, design system, and components with the main CRM admin app.

Success looks like: an employee applies for leave or marks attendance in seconds
and trusts it landed; an HR operator approves a queue, spots who's absent, and
publishes a holiday faster and with fewer mistakes than in a spreadsheet or a
generic template admin.

## Brand Personality

**Sharp, modern, efficient.** Voice is direct and competent — short labels, plain
verbs, no marketing gloss. The app should feel like a precision instrument:
confident defaults, fast feedback, nothing ornamental between the user and the
task. Closer to a keyboard-first power tool than a friendly consumer app, but never
cold or hostile — clarity and momentum are the emotional goals, not
delight-for-its-own-sake.

When in doubt, behave like the tool the user already trusts: predictable, quick,
quietly opinionated.

## Anti-references

- **Generic Bootstrap / AdminLTE template admin** — heavy borders, gradient buttons,
  cramped tables, flat hierarchy. The default dated-enterprise look to actively avoid.
- **Over-decorated SaaS** — gradient-text heroes, glassmorphism, everything-rounded,
  decorative motion. Spectacle that gets between the user and the work.
- **Sterile / lifeless gray** — so restrained it becomes joyless and hard to scan;
  flat gray with zero hierarchy or accent intent.
- **Cluttered & noisy** — too many accent colors, competing CTAs, density without
  rhythm. Overwhelming dashboards that bury the one thing the user came for.

Reference bar (the feel to match, not to copy): **Linear** (tight, fast, keyboard-first,
precise spacing), **Vercel / Raycast** (sharp monochrome with one decisive accent,
crisp dark mode), and **Notion** (approachable structure and breathing room so
occasional/self-service users aren't intimidated).

## Design Principles

1. **The tool disappears into the task.** Earned familiarity beats novelty. Standard
   affordances for standard jobs; surprise only where it genuinely helps.
2. **Density with rhythm.** Show the data HR operators need, but vary spacing and
   weight so a screen is scannable — never a wall, never empty filler.
3. **One accent, used with intent.** Color marks primary action, current selection, and
   state — not decoration. The themeable palette is a system, not confetti.
4. **Every state is designed.** Hover, focus, active, disabled, loading (skeletons, not
   spinners), empty (teach the interface), error. Half-built states are the tell.
5. **Fast feedback, quiet motion.** 150–250ms transitions that convey state change, not
   choreography. The app reacts instantly; it never makes the user wait to watch it move.
6. **Legible to the newcomer, fast for the regular.** Defaults and empty states teach
   first-time/self-service users; keyboard paths and density reward the daily operator.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**.

- Body text ≥ 4.5:1 contrast against its background; large/bold text ≥ 3:1. No muted
  light-gray body text on tinted near-white — bump toward the ink end of the ramp.
- Visible, non-color-only focus indicators on every interactive element; full keyboard
  navigation (the app should be operable without a mouse).
- Honor `prefers-reduced-motion` — every transition needs a crossfade/instant fallback.
- Don't encode meaning in color alone (the blue/green/red/purple/orange status system —
  including attendance states like present/absent/on-leave — must pair with text or icon).
- Dark mode is a first-class theme, not an afterthought — verify contrast in both.
