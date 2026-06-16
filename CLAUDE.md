# CLAUDE.md

Guidance for anyone (human or AI) working in this repository.

## What this is

**World Explorer** — a static, kid-friendly interactive map for learning the
world's **195 countries**: continents, capitals, flags, key figures, "known for"
facts, country outlines, and a quiz.

- **Live:** https://endorrfin.github.io/world-explorer/
- **Stack:** Vite + React 18 + TypeScript. No backend, no runtime fetches.
- **Hosting:** GitHub Pages, published automatically by GitHub Actions on push to `main`.

## Commands

```bash
npm install        # install dependencies (Node 22+)
npm run dev        # local dev server  → http://localhost:5173
npm run build      # tsc typecheck + Vite production build → dist/
npm run preview    # serve the production build locally
npm run data       # regenerate src/data/countries.json from data.xlsx (Python + openpyxl)
npm run shapes     # regenerate src/data/shapes.json (country outlines) from Natural Earth
```

Deploy is automatic: push to `main`, and `.github/workflows/deploy.yml` runs
`npm ci && npm run build` and publishes `dist/` to Pages. Pages **Source** must be
set to **GitHub Actions** (Settings → Pages).

## Architecture

- **Single-page app** with hash routing: `#/explore/<continent>/<ISO2>` and `#/quiz`.
  No router library — routing is a small custom layer in `src/App.tsx`.
- **All data is static JSON** imported at build time. The app fetches nothing at runtime,
  so it works offline and under any sub-path.
- **Layout:** top bar (brand, Explore/Quiz tabs, search) → sidebar (continents) →
  main grid of country tiles → detail panel. The quiz is a separate tab.
- **`vite base` is `'./'`** (relative) + hash routing, so the site works under any
  GitHub Pages project sub-path **without config changes**.

### Key files

```
data.xlsx                     source spreadsheet (the origin of all figures)
scripts/
  build_data.py               data pipeline: xlsx → countries.json (cleans, fixes, joins, merges facts)
  build_shapes.mjs            country outlines: world-atlas TopoJSON → shapes.json
src/
  data/
    facts.json                EDITABLE "Known for" facts, keyed by ISO-2
    countries.json            GENERATED app data — do not hand-edit
    shapes.json               GENERATED country outlines — do not hand-edit
  components/
    Sidebar.tsx               continent list with counts
    CountryCard.tsx           tile: flag + name + capital + outline
    CountryDetail.tsx         detail panel (Identity / People / Economy / Land / Known for)
    CountryShape.tsx          renders an SVG silhouette from shapes.json
    Quiz.tsx                  5-mode quiz with scoring
    Flag.tsx                  flag-icons wrapper
  lib/
    continents.ts             continent metadata (order, accent colour, emoji)
    format.ts                 number/currency/percent formatters (null → "—")
  App.tsx                     layout, search, tabs, hash routing
  styles.css                  all styling (clean & neutral theme + responsive rules)
```

### Data flow

```
data.xlsx ──build_data.py──► countries.json  (facts.json merged in)
world-atlas TopoJSON ──build_shapes.mjs──► shapes.json
App imports countries.json + shapes.json (static)
```

## Data notes & gotchas

- **Never hand-edit** `countries.json` or `shapes.json` — they are generated. To change
  content: edit `data.xlsx` (figures) or `src/data/facts.json` (facts), then re-run
  `npm run data`. To change outlines, edit `build_shapes.mjs` and run `npm run shapes`.
- **Continents are derived from the sub-region, not the source's `region` column.** The
  spreadsheet wrongly labels every Caribbean state as "Oceania"; `continent_for()` in
  `build_data.py` fixes this. Result: Africa 54, Asia 48, Europe 44, North America 23,
  South America 12, Oceania 14.
- **Name / capital cleanups** live in `NAME_FIX`, `CAPITAL_FIX`, and `clean_capital()`
  (e.g. `LCA → Saint Lucia`, `Russian Federation → Russia`, `Jakarta[9] → Jakarta`,
  Nauru → `Yaren`, South Africa's three capitals restored).
- **Coverage gaps** are rendered as `—`: births/day 99/195, peace index 160/195,
  GDP-per-capita missing for 17 small states, outlines 194/195 (Tuvalu is too small at
  this map resolution).
- **Flags** use the offline `flag-icons` SVG set keyed by ISO-2 (not emoji, which don't
  render on Windows).
- The four shape-generation packages (`world-atlas`, `topojson-client`, `d3-geo`,
  `world-countries`) are **devDependencies only** — the app ships the committed
  `shapes.json` and never imports them at runtime.

## Conventions

- TypeScript is **strict** with `noUnusedLocals`/`noUnusedParameters` — the build fails
  on unused symbols.
- Components in `src/components`, pure helpers in `src/lib`. Keep displayed numbers going
  through `src/lib/format.ts` so `null` becomes `—` consistently.
- Continent accent colours and order come from `src/lib/continents.ts`.

## What was built (history)

- **v1** — data pipeline (xlsx → clean JSON, continent-bug fix), explorer UI
  (sidebar + tiles + detail), "Known for" facts for all 195 countries, quiz
  (capital / flag / continent), GitHub Pages deploy workflow.
- **v1.1** — country outlines on tiles and in the detail header; two more quiz modes
  (population, shape); capital footnote/Nauru fixes; published to GitHub Pages.

## Possible improvements (roadmap)

### UI / UX
- **Mobile/touch polish** — verify and refine the responsive layout on phones (sidebar,
  detail overlay, tap targets, quiz buttons).
- **Full names & capitals on tiles** — long names ("Saint Vincent and the Grenadines")
  and capitals ("Sri Jayawardenapura Kotte") are currently truncated; let them wrap or
  use roomier tiles.
- **Dark-mode toggle** and a **larger-text mode** for younger readers.
- **A real geographic map view** — a clickable SVG world map (zoom to continent → click a
  country), complementing the current list/cards. This was the original "map" idea.

### Content / data
- Add fields kids enjoy: **languages, currency, time zone, calling code already shown,
  national animal, neighbouring countries, area/population rank, flag meaning**.
- **Landmark photos** in the detail panel (would require bundling/licensing images).
- A **"data as of" date** and source notes; refresh figures (currently 2023–2025 mix).
- Fill the **coverage gaps** (births/day, peace index) from a more complete source.

### Quiz
- **High scores / streaks** saved in `localStorage`; per-continent progress.
- **Difficulty levels**, optional **timer**, and **hints**.
- More modes: currency, language, "which country is bigger" (area), flag → capital.
- Light **sound/animation** feedback for correct/wrong answers.

### Quality / tech
- **Subset the flag CSS** — `flag-icons` ships all ~260 flags (~430 KB CSS); generating
  CSS for just the 195 used flags would shrink the bundle noticeably.
- **Unit tests** for the data pipeline (counts, continent mapping, no nulls in required
  fields) and quiz logic; **Playwright** smoke test of the built site.
- **PWA**: installable + offline service worker — ideal for tablets in classrooms.
- **Accessibility**: full keyboard navigation, visible focus rings, ARIA labels,
  `prefers-reduced-motion`, contrast audit.
- **i18n**: optional Ukrainian/English UI toggle (content stays English by request).
- **Pronunciation audio** (TTS) for country and capital names.
