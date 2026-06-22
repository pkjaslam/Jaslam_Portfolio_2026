# Premium Portfolio Redesign

Transform the current single-page cinematic site into a multi-route, product-grade research portfolio with Apple/OpenAI-level polish, while preserving the forest/data atmosphere already built.

## Architecture

Move from one long `/` page to a structured route tree (TanStack Start file-based routing). Each route gets its own SEO head + atmosphere band.

```
/                → Cinematic hero + signature identity + highlights
/research        → Career timeline + research narrative
/tools           → Tool ecosystem (FOREST, SDImax, RG Trial, ...)
/projects        → Flagship case studies (problem→method→output→impact)
/publications    → Interactive explorer (search, filters, year, featured)
/impact          → Dashboard: citations, grants, plots, orgs, map
/about           → Bio, education, certifications, affiliations
/contact         → CTA + socials + CV download
```

Keep `index` cinematic; subroutes are dense, product-style pages.

## Global system

- **Sticky top nav** with scroll-aware active state, compact mobile menu, "Download CV" button.
- **Command palette** (⌘K / Ctrl-K) using existing `cmdk` — quick-jump to any route/section, search publications & tools.
- **Theme**: dark default + light toggle (persisted), refined token system in `src/styles.css` (forest-intelligent palette: deep moss, fog, phosphor accent, warm bone).
- **Typography**: editorial serif display (Instrument Serif or Fraunces) + clean sans body (Inter Tight). Loaded via `<link>` in `__root.tsx`.
- **Motion**: scroll-reveal, hover-lift cards, parallax restraint, page transitions. Keep current `PageAtmosphere` as a route-aware background.
- **SEO**: per-route `head()` with title, description, og:*, canonical; JSON-LD Person on root.

## Page specs

**Home (`/`)** — Cinematic only, lighter than current:
- Hero: strong headline, subhead, two CTAs (View Research / Contact), forest video kept, ambient kept.
- 3 signature stat tiles (animated counters).
- 3 flagship tool teasers → link to `/tools`.
- "Featured publication" card → `/publications`.
- Affiliations strip (existing component).

**Research (`/research`)** — vertical timeline: Statistics → Ag research → Data science → ML → Remote sensing → Forestry intelligence → Decision tools. Each node expands.

**Tools (`/tools`)** — ecosystem grid + connection diagram (reuse `NodeNetworkCanvas`). Each tool = product card with hover modal (problem/method/output/impact/screens).

**Projects (`/projects`)** — case-study cards, same structure as tools but project-scoped.

**Publications (`/publications`)** — explorer: search input, year chips, topic filters, featured row, citation-style cards with hover preview.

**Impact (`/impact`)** — dashboard: animated counters, US states map (existing SVG), grants table, citations chart, orgs using tools.

**About + Contact** — clean editorial layout, education/certs last, social proof tasteful.

## Components to build

- `SiteNav` (sticky, scroll-aware, mobile sheet)
- `CommandPalette` (⌘K)
- `ThemeToggle`
- `StatCounter` (animated)
- `ProjectCard` + `ProjectModal`
- `PublicationExplorer` (search/filter/cards)
- `Timeline`
- `ToolEcosystem` (reuse `NodeNetworkCanvas`)
- `PageTransition` wrapper
- `Footer` (CV download, socials, contact)

## Files touched

- New: `src/routes/{research,tools,projects,publications,impact,about,contact}.tsx`
- New: `src/components/site/{SiteNav,CommandPalette,ThemeToggle,Footer,PageTransition}.tsx`
- New: `src/components/portfolio/{StatCounter,ProjectCard,Timeline,PublicationExplorer,ToolEcosystem}.tsx`
- New: `src/data/{publications,tools,projects,timeline,stats}.ts` (content data)
- Edit: `src/routes/__root.tsx` (nav, footer, fonts, theme provider, palette)
- Edit: `src/routes/index.tsx` (slim cinematic hero + teasers)
- Edit: `src/styles.css` (refined tokens, light mode)
- Keep: `PageAtmosphere`, `AmbientAudio`, `Narrator`, `AffiliationsPanel`, `NodeNetworkCanvas`

## Scope decisions I need from you

This is a large rebuild (multiple new routes + nav system + content data). Before I start I need:

1. **Content** — do you have real publications/tools/projects/timeline data to drop in, or should I scaffold with realistic placeholders you'll edit later?
2. **CV file** — do you have a PDF to wire into the "Download CV" button, or skip for now?
3. **Light mode** — do you actually want it, or keep the cinematic dark-only feel (most premium research sites stay dark)?
4. **Build order** — full multi-route rebuild in one pass (long), or ship in phases (1: nav + palette + slimmed hero, 2: research/tools/publications, 3: impact/about/contact)?

Answer 1–4 and I'll execute.