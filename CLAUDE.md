# CLAUDE.md

Guidance for anyone (human or AI) working in this repository.

## What this is

**World Explorer** — a static, kid-friendly interactive map for learning the
world's **195 countries** — continents, capitals, flags, key figures, "known for"
facts, country outlines, a clickable world map and quizzes, plus an in-depth
**Ukraine** tab. Fully bilingual (English / Ukrainian).

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
npm run worldmap   # regenerate src/data/worldmap.json (single-projection clickable map)
npm run neighbors  # regenerate src/data/neighbors.json (land borders) from world-countries
npm run uaregions  # regenerate src/data/ukraine_regions.json (oblast map) — needs amcharts5-geodata
```

Deploy is automatic: push to `main`, and `.github/workflows/deploy.yml` runs
`npm ci && npm run build` and publishes `dist/` to Pages. Pages **Source** must be
set to **GitHub Actions** (Settings → Pages).

## Architecture

- **Single-page app** with hash routing: `#/map/<ISO2>`, `#/explore/<continent>/<ISO2>`,
  `#/quiz`, `#/ukraine` and `#/about` (Map is the default landing tab). No router library —
  routing is a small custom layer in `src/App.tsx`.
- **All data is static JSON** imported at build time. The app fetches nothing at runtime,
  so it works offline and under any sub-path.
- **Layout:** top bar (brand, Map/Explore/Quiz/Ukraine/About tabs, search, EN/UA toggle). Explore shows a sidebar
  (continents) → grid of country tiles → detail panel; Map and Quiz are separate tabs that
  share the same detail panel.
- **`vite base` is `'./'`** (relative) + hash routing, so the site works under any
  GitHub Pages project sub-path **without config changes**.
- **Static assets must resolve relatively.** Reference public assets in `index.html` with a
  root path (`/favicon.svg`) and let Vite rewrite it to `./favicon.svg` at build — an absolute
  `/favicon.svg` would break under the `/world-explorer/` sub-path. The tab icon is an inline
  SVG globe at `public/favicon.svg` (plus a `theme-color` meta); `public/.nojekyll` stops Pages
  from running Jekyll.

### Key files

```
data.xlsx                     source spreadsheet (the origin of all figures)
index.html                    app shell: title, description, favicon link, theme-color
public/ukraine_{eng,ua}.json  Ukraine settlement hierarchy (lazy-loaded at runtime)
public/favicon.svg            inline SVG globe favicon (referenced from index.html)
public/.nojekyll              tells GitHub Pages to skip Jekyll processing
scripts/
  build_data.py               data pipeline: xlsx → countries.json (cleans, fixes, joins, merges facts)
  build_shapes.mjs            country outlines: world-atlas TopoJSON → shapes.json
  build_worldmap.mjs          single-projection clickable map: TopoJSON → worldmap.json
  lib_crimea.mjs              shared: reassign the Crimea polygon Russia → Ukraine (used by both above)
  build_neighbors.mjs         land-border lists: world-countries → neighbors.json
  build_ukraine_regions.mjs   Ukraine oblast map: amCharts geodata → ukraine_regions.json
  build_names_uk.mjs          Ukrainian country names: i18n-iso-countries → names_uk.json
src/
  data/
    facts.json                EDITABLE "Known for" facts (English), keyed by ISO-2
    facts_uk.json             EDITABLE "Known for" facts (Ukrainian), keyed by ISO-2
    countries.json            GENERATED app data — do not hand-edit
    shapes.json               GENERATED country outlines — do not hand-edit
    worldmap.json             GENERATED single-projection map (paths + continent boxes)
    neighbors.json            GENERATED land-border lists (merged into countries.json)
    ukraine_regions.json      GENERATED clickable oblast map (paths + EN/UA tree links)
    names_uk.json             Ukrainian country names (merged into countries.json)
    capitals_uk.json          EDITABLE Ukrainian capitals (merged into countries.json)
  components/
    Sidebar.tsx               continent list with counts
    CountryCard.tsx           tile: flag + name + capital + outline
    CountryDetail.tsx         detail panel (People / Economy / Land / Neighbours / Known for)
    CountryShape.tsx          renders an SVG silhouette from shapes.json
    WorldMap.tsx              clickable geoEqualEarth world map (pan/zoom, markers); reused by the game
    FindGame.tsx              "Where in the world?" game — click the country on the map
    Quiz.tsx                  6-mode quiz (incl. the map game) with scoring
    UkraineTab.tsx            Ukraine settlements tree (EN/UA toggle, lazy-loaded)
    AboutTab.tsx              bilingual "About / Опис" page describing every feature
    Flag.tsx                  flag-icons wrapper
  lib/
    continents.ts             continent metadata (order, accent colour, emoji)
    format.ts                 number/currency/percent formatters (null → "—", locale-aware)
    i18n.ts                   UI strings (EN/UK), language context, locale helpers
  App.tsx                     layout, search, tabs, hash routing
  styles.css                  all styling (clean & neutral theme + responsive rules)
```

### Data flow

```
data.xlsx ──build_data.py──► countries.json  (facts.json + facts_uk.json merged in)
world-atlas TopoJSON ──build_shapes.mjs──► shapes.json
App imports countries.json + shapes.json (static)
```

## Data notes & gotchas

- **Never hand-edit** `countries.json` or `shapes.json` — they are generated. To change
  content: edit `data.xlsx` (figures), `src/data/facts.json` (English facts) or
  `src/data/facts_uk.json` (Ukrainian facts), then re-run `npm run data`. To change
  outlines, edit `build_shapes.mjs` and run `npm run shapes`.
- **"Known for" facts are bilingual:** `facts.json` (EN) and `facts_uk.json` (UK) both
  key 195 ISO-2 codes → arrays of 2–4 strings, merged into `countries.json` as `knownFor`
  and `factsUk`. The detail panel shows `factsUk` when the language is Ukrainian and falls
  back to English if a translation is missing. Keep the two files in sync (same keys,
  same per-country count).
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
- **Crimea is shown as Ukraine.** Natural Earth (and thus world-atlas) draws Crimea &
  Sevastopol as de-facto Russian since v4.0; that is not their international status
  (UN GA Resolution 68/262, 2014). `scripts/lib_crimea.mjs` moves the Crimea polygon out
  of Russia's feature and into Ukraine's, in GeoJSON space, before projection — applied by
  **both** `build_shapes.mjs` (tiles/detail outline) and `build_worldmap.mjs` (clickable
  map). Detection is by interior anchor points (Simferopol/Yevpatoria/Kerch), so only the
  Crimea polygon moves and Russia's mainland (incl. Taman) is untouched. Re-run
  `npm run shapes` and `npm run worldmap` after touching the source data.
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
- **v1.2** — responsive mobile layout + non-truncated wrapping tiles; a real **clickable
  world map** tab (geoEqualEarth single projection, colour-by-continent, continent zoom,
  click → detail panel), now the default landing tab.
- **v1.3** — map polish: **animated (eased) zoom**, **clickable markers** for 31 tiny
  island/micro states (incl. Tuvalu, which has no shape at this resolution), a **"Locate
  on map"** button (Explore → Map) that flies to the country's continent and **pulses**
  it, plus projected centroids for all 195 (`cen` in worldmap.json).
- **v1.4** — real map navigation: **drag-to-pan**, **wheel/pinch zoom** (cursor-centred)
  and **double-click / double-tap to zoom in**, with clamping. Continent buttons, Locate
  and markers are unchanged; markers fade out once you zoom in.
- **v1.5** — **"Where in the world?"** game (a Quiz mode): read a country name, click it on
  the live map; green/red feedback, reveal-pulse on the answer, score over a round of 8.
  Reuses `WorldMap` in game mode (`feedback` / `forceMarkers` / `initialZoom` props).
- **v1.6** — **neighbour highlighting**: selecting a country outlines its land neighbours on
  the map (`showNeighbors`) and lists them (clickable) in the detail panel. Borders come from
  `world-countries` via `build_neighbors.mjs`; islands show "no land borders".
- **v1.7** — **Ukraine** tab: a lazy-loaded, collapsible **settlements tree**
  (Region → District → Hromada → Settlement, 29,582 places, 2001-census population) with an
  **EN/UA toggle** and settlement search. Data lives in `public/ukraine_*.json` (loaded on
  open, not bundled).
- **v1.8** — clickable **Ukraine regions map** (amCharts admin-1 oblast geometry via
  `build_ukraine_regions.mjs` → `ukraine_regions.json`) is the Ukraine tab's entry: click an
  oblast → drill into that region's settlements tree (or a "🌳 All settlements" toggle opens
  the whole country-wide tree). Each
  oblast is linked to its EN **and** UA tree index (the two data files are alphabetised
  differently); Kyiv City & Sevastopol map onto Kyiv / Crimea.
- **v1.9** — **bilingual UI (English / Ukrainian)**: a global EN/UA toggle in the top bar
  (browser-detected default, saved to `localStorage`), a lightweight typed i18n module
  (`src/lib/i18n.ts` — `uk` is type-checked against `en`), and locale-aware number formatting.
  The Ukraine tab follows the global toggle. Country **names, capitals and "Known for" facts
  are still English** (Phase 2 = names + capitals, Phase 3 = facts).
- **v1.10** — **Phase 2 i18n**: country **names and capitals** now switch with the language
  (`nameUk` from `i18n-iso-countries` + overrides, `capitalUk` hand-curated, both merged into
  `countries.json`). Shown on tiles, the detail panel, map tooltips, the quiz (options +
  prompts) and search (matches both languages). Only the 630 "Known for" facts remain English.
- **v1.11** — **Phase 3 i18n (complete bilingual content)**: all **630 "Known for" facts are
  now translated** (`src/data/facts_uk.json`, merged into `countries.json` as `factsUk` by
  `build_data.py`); the detail panel shows them when the language is Ukrainian (EN fallback if
  a translation is missing). Also adds an **About / "Опис"** tab (`AboutTab.tsx`, route
  `#/about`) — a bilingual page describing every feature (Map, Explore, country details, Quiz,
  "Where in the world?", Ukraine, the EN/UA toggle, offline & open-source). The whole app —
  UI, names, capitals **and** facts — is now fully bilingual.
- **v1.12** — **Crimea shown as Ukraine** (UN GA Res 68/262): `scripts/lib_crimea.mjs` moves
  the Crimea polygon out of Russia and into Ukraine in both the tile/detail outlines
  (`build_shapes.mjs`) and the clickable world map (`build_worldmap.mjs`) — see Data notes.
  Plus polish: a **contact block** in the About tab (`krupka.ua@gmail.com`), a reword of the
  "Where in the world?" game line, and a new **SVG globe favicon** (`public/favicon.svg`) with
  a `theme-color` meta.

## Possible improvements (roadmap)

### UI / UX
- **Mobile/touch polish** — verify and refine the responsive layout on phones (sidebar,
  detail overlay, tap targets, quiz buttons).
- **Full names & capitals on tiles** — long names ("Saint Vincent and the Grenadines")
  and capitals ("Sri Jayawardenapura Kotte") are currently truncated; let them wrap or
  use roomier tiles.
- **Dark-mode toggle** and a **larger-text mode** for younger readers.
- **Map polish (remaining)** — optional **on-map country labels** (names of larger
  countries when zoomed in). Animated zoom, markers, locate-pulse and free pan/pinch/
  double-click zoom are done (v1.3–v1.4).

### Content / data
- Add fields kids enjoy: **languages, currency, time zone, calling code already shown,
  national animal, area/population rank, flag meaning**.
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
- **i18n: DONE** — the app is fully bilingual: UI strings (v1.9), country names + capitals
  (v1.10) and all 630 "Known for" facts (v1.11). Future translation work would only be new
  content (e.g. additional facts) — keep `facts.json` and `facts_uk.json` in sync.
- **Pronunciation audio** (TTS) for country and capital names.

## Known limitations & concerns

Carry these forward — they are the open risks/trade-offs as of v1.12.

- **Crimea seam (cosmetic).** Reassigning the Crimea polygon (`lib_crimea.mjs`) can leave a
  hairline gap along the Perekop isthmus between mainland Ukraine and Crimea; invisible at
  tile/world-map scale. A truly seamless join would need a polygon **union** of the two rings
  (e.g. `polygon-clipping`/`martinez`). Also consider asserting the helper returns `1`
  (exactly one polygon moved) inside the builders, to fail loudly if a future Natural Earth
  release renames/splits/merges the Crimea polygon and the anchor-point detection drifts.
- **Favicon is SVG-only.** Renders in all current desktop browsers and Safari 16.4+. For very
  old browsers and the iOS home-screen icon, add a rasterised `favicon.ico` and a PNG
  `apple-touch-icon` (180×180) next to `favicon.svg`.
- **Bundle size** is dominated by `flag-icons` (~430 KB CSS shipping all ~260 flags; ~89 KB
  gzip). App JS is ~606 KB / ~200 KB gzip. Subsetting the flag CSS to the 195 used flags is
  the biggest easy win (see Quality / tech).
- **Building off linux-x64** (e.g. a local Apple-silicon sandbox) can hit npm's optional-
  dependency bug for Rollup's native binary (`Cannot find module @rollup/rollup-*`); work
  around with `npm i @rollup/rollup-<platform> --no-save`. **GitHub Actions CI is unaffected** —
  a fresh `npm ci` on linux-x64 installs the right binary, so deploys build cleanly.
- **Keep `facts.json` and `facts_uk.json` in sync** — identical 195 keys and the same
  per-country count; `build_data.py` merges both into `countries.json` (`knownFor` / `factsUk`).
- **Data freshness.** Figures are a 2023–2025 mix with no on-screen "data as of" date; coverage
  gaps persist (births/day 99/195, peace index 160/195, GDP-per-capita ~178/195, outlines
  194/195 — Tuvalu has no shape at this resolution).
- **No automated tests yet.** There's no CI guard on the data pipeline (counts, continent map,
  required-field nulls), the i18n key parity, or the built site — regressions are caught only
  by `npm run build` (tsc) and manual checks.
