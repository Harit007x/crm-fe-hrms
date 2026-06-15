---
name: Zynetz HRMS
description: A sharp, efficient HR portal for attendance, leaves, and people operations — the tool disappears into the task.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.141 0.005 285.823)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.141 0.005 285.823)"
  popover: "oklch(1 0 0)"
  primary: "oklch(0.488 0.243 264.376)"
  primary-foreground: "oklch(0.97 0.014 254.604)"
  secondary: "oklch(0.967 0.001 286.375)"
  secondary-foreground: "oklch(0.21 0.006 285.885)"
  muted: "oklch(0.967 0.001 286.375)"
  muted-foreground: "oklch(0.552 0.016 285.938)"
  accent: "oklch(0.967 0.001 286.375)"
  accent-foreground: "oklch(0.21 0.006 285.885)"
  border: "oklch(0.92 0.004 286.32)"
  input: "oklch(0.92 0.004 286.32)"
  ring: "oklch(0.708 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  status-blue: "oklch(0.6603 0.188 250.24)"
  status-blue-bg: "oklch(0.9185 0.044 238.91)"
  status-green: "oklch(0.72626 0.19826 149.565)"
  status-green-bg: "oklch(0.9328 0.038 157.4)"
  status-red: "oklch(0.6453 0.24 27.31)"
  status-red-bg: "oklch(0.9452 0.027 17.65)"
  status-purple: "oklch(0.648 0.211 294.42)"
  status-purple-bg: "oklch(0.9387 0.034 300.31)"
  status-orange: "oklch(0.7802 0.163 63.06)"
  status-orange-bg: "oklch(0.9533 0.042 78.97)"
  sidebar: "oklch(0.985 0 0)"
  sidebar-foreground: "oklch(0.37 0.013 286)"
  sidebar-border: "oklch(0.92 0.005 256)"
typography:
  display:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "24px"
  badge-status:
    backgroundColor: "{colors.status-blue-bg}"
    textColor: "{colors.status-blue}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  nav-item-active:
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "8px"
---

# Design System: Zynetz HRMS

> Shares one design language with the main Zynetz CRM admin (`crm-fe`). Same tokens,
> same components, same north star — specialized here for HR workflows (attendance,
> leaves, holidays, daily reports). Keep the two apps visually identical.

## 1. Overview

**Creative North Star: "The Quiet Workshop"**

Zynetz HRMS is an organized workbench for the people who run the human side of a
services business all day — attendance, leaves, holidays, daily reports, events —
plus the project and expense context HR touches. Tools sit exactly where you expect
them. The surface is calm and uncluttered so the data is the loudest thing on
screen, but there's enough warmth in the details — a tactile button press, a soft
lift on a card, one confident accent — that it never feels sterile. HR operators
move fast through dense queues; employees self-serving a leave or attendance entry
aren't intimidated by the breathing room.

The system is built on shadcn (new-york) with a slate-derived neutral ramp and a
single vivid indigo accent that earns its place by marking only what is **live,
primary, or selected**. Depth is **subtly layered**: hairline borders and tonal
surface shifts (a quiet off-white sidebar against pure-white content) do most of the
structural work, with soft shadows giving resting cards a gentle lift and floating
elements (popovers, dialogs, dropdowns) a clear separation. Components feel
**tactile and confident** — hover and active states shift visibly, fills have
presence — without tipping into decoration.

This system explicitly rejects four things, carried straight from PRODUCT.md: the
dated **Bootstrap/AdminLTE template** look; **over-decorated SaaS**; **sterile
lifeless gray**; and **cluttered noise**. The bar is Linear / Vercel-Raycast for
precision and Notion for approachability.

**Key Characteristics:**
- One vivid indigo accent, reserved for primary action / current selection / live state.
- A five-color semantic status system (blue, green, red, purple, orange) for data —
  including attendance/leave states (present, absent, on-leave, pending) — never decoration.
- Hairline borders + tonal layering as the primary structural device; shadows are a gentle assist.
- Manrope across the entire UI — one family, multiple weights — for a unified, legible voice.
- Restrained but tactile: density that rewards fluency, breathing room that welcomes newcomers.
- First-class dark mode and a runtime accent switcher (`data-theme`: blue/green/red/purple/orange).

## 2. Colors

A near-monochrome slate-neutral foundation lit by a single high-chroma indigo, with a tight
five-hue palette reserved exclusively for status.

### Primary
- **Signal Indigo** (`oklch(0.488 0.243 264.376)`): The one accent. Primary buttons, the active
  navigation item (as a 10%-opacity tint, `bg-primary/10 text-primary`), selection highlights,
  focus intent, links, and live-state indicators. Its scarcity is what makes it read as
  "this matters." Paired with **Indigo Tint** (`oklch(0.97 0.014 254.604)`) as its foreground.

### Neutral
- **Workshop Ink** (`oklch(0.141 0.005 285.823)`): Primary text and headings. Cool near-black.
- **Muted Ink** (`oklch(0.552 0.016 285.938)`): Secondary text, captions, inactive nav labels,
  placeholders. Verified ≥4.5:1 on white — used for *de-emphasis*, never for body copy.
- **Pure White** (`oklch(1 0 0)`): Content background and card surface.
- **Sidebar Off-White** (`oklch(0.985 0 0)`): The sidebar/panel surface — one tonal step cooler
  and quieter than content, so the chrome recedes behind the work.
- **Hairline** (`oklch(0.92 0.004 286.32)`): Borders, inputs, dividers. 1px, low-contrast — the
  primary structural device of the whole system.

### Tertiary — The Status Palette
Five hues, each with a light tinted background companion. Used **only** to encode state in
badges, charts, and data — never as decoration or brand color.
- **Status Blue**: informational / in-progress / scheduled.
- **Status Green**: success / approved / present / paid.
- **Status Red**: error / rejected / absent / overdue. Aligns with `destructive`.
- **Status Purple**: special / pending review / on-leave.
- **Status Orange**: warning / on-hold / pending / late.

### Named Rules
**The One Voice Rule.** Signal Indigo appears on ≤10% of any screen. One primary action per
view, the current nav item, the focused field.

**The Status-Only Rule.** The five status hues are forbidden as decoration. These colors mean
something; spending them on aesthetics destroys the signal.

**The Color-Plus Rule.** Status is never carried by color alone (WCAG AA). Every status badge
pairs its hue with a text label or icon.

## 3. Typography

**Display Font:** Outfit — available via `.font-display` for the rare branded moment (logo
lockups, auth screens). **Body / UI Font:** Manrope — the workhorse for the entire product.

Manrope is a humanist-geometric sans with subtly rounded terminals — modern and crisp but never
cold. One family carries headings, labels, body, buttons, and dense table data; weight and size
do all the hierarchy work.

### Hierarchy
- **Headline** (Manrope 700, ~1.5rem): Page titles (use the shared `PageHeader`).
- **Title** (Manrope 600, 1rem): Card titles, section headers, dialog titles.
- **Body** (Manrope 400, 0.875rem): Default UI and content text.
- **Label** (Manrope 500, 0.75rem): Badges, table headers, nav category headers, helper text.

**The One-Family Rule.** Manrope is the entire product UI. **The Fixed-Scale Rule.** Type sizes
are a fixed rem scale, never fluid `clamp()`.

## 4. Elevation

Subtly layered, not flat and not lifted. Structure comes first from **1px hairline borders** and
**tonal surface shifts** (off-white sidebar vs. pure-white content). Soft low-spread shadows give
resting cards a gentle separation; progressively stronger shadows lift floating elements
(dropdowns, popovers, dialogs, sheets). Shadows are atmospheric — diffuse and barely tinted.

- **Control (`shadow-xs`)**: Inputs and outline buttons.
- **Resting (`shadow-sm`)**: Cards and panels at rest.
- **Floating (`shadow-md` / `shadow-lg`)**: Dropdowns, popovers, dialogs, sheets.

**The Border-First Rule.** Reach for a hairline border and a tonal shift before a shadow.
**The No-Hard-Shadow Rule.** No dark, tight, high-opacity drop shadows.

## 5. Components

The vocabulary is shadcn (new-york) tuned to one accent and the status palette. Same button
shape, same field shape, same icon family (Lucide) on every screen. The app ships shared
primitives that pages must use instead of bespoke styling:

- **`PageHeader`** — the one page-title pattern (headline + description + actions).
- **`StatCard`** / **`StatCardSkeleton`** — KPI tiles with a quiet muted icon chip.
- **`StatusBadge`** (+ `lib/status` `statusVariant`) — status string → semantic pill.
- **`TableSkeleton`** — list loading state (skeletons, not center spinners).
- **`Logo` / `LogoMark` / `APP_NAME`** — the Zynetz mark; **`AuthBrandPanel`** — the auth panel.

### Badges (signature)
Full pill (`rounded-full`), `text-xs` weight 500, `px-2 py-0.5`. The five semantic pairs — e.g.
`green` = green text on green-tint background — are the product's most distinctive, most-reused
pattern: status at a glance across attendance, leaves, holidays, reports.

### Cards / Containers
12px (`rounded-xl`), pure white, `shadow-sm` + 1px hairline border. **Nesting is forbidden** — a
card inside a card is always a layout failure; use a divider, spacing, or a tonal section.

### Navigation
Fixed 18rem sidebar, Sidebar Off-White surface, 1px right border. Items grouped under uppercase
`text-xs` Muted Ink category headers. Active item = Signal Indigo text on a 10% indigo tint
(`bg-primary/10 text-primary`). Collapses off-canvas under 1024px with a `bg-black/60` backdrop.

## 6. Do's and Don'ts

### Do:
- Keep Signal Indigo to ≤10% of any screen — rarity is the signal.
- Reserve the five status hues for state only, always paired with a label or icon.
- Build structure from hairline borders and tonal surface shifts first; shadows assist.
- Use Manrope for the entire UI — hierarchy through weight and size, not a second font.
- Ship every interactive state, including loading (skeletons) and empty (teach the screen).
- Keep motion at 150–250ms; honor `prefers-reduced-motion`.
- Money is **INR (₹)**; format with `toLocaleString("en-IN")`.

### Don't:
- Ship the **Bootstrap/AdminLTE template look**, **over-decorated SaaS**, **sterile gray**, or **clutter**.
- Use raw Tailwind colors (`text-green-600`, `bg-red-50`) — use tokens / `StatusBadge`.
- Use a colored `border-left` accent stripe, pair a 1px border with a wide drop shadow, over-round, or nest cards.
- Use fluid `clamp()` type or a display font inside the app chrome.
