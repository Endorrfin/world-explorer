# 🌍 World Explorer

An interactive map for learning the world's **195 countries** with kids — capitals,
flags, key figures, country outlines, "known for" facts, land neighbours, and a quiz.

**Live:** https://endorrfin.github.io/world-explorer/
**Stack:** Vite + React 18 + TypeScript · static, no backend · deployed to GitHub Pages.

**Language / Мова:** [English](#-english) · [Українська](#-українська)

---

## 🇬🇧 English

World Explorer is a static, kid-friendly web app. It runs fully offline (all data is
bundled JSON, flags are local SVGs) and deploys to GitHub Pages with no server. The app
has three tabs — **Map**, **Explore** and **Quiz** — that share one country detail panel.

### Features

1. **Interactive world map.** A real `geoEqualEarth` projection of all 195 countries,
   coloured by continent. **Drag** to pan, **scroll or pinch** to zoom (centred on the
   cursor), **double-click / double-tap** to zoom in, or jump straight to a continent with
   the zoom buttons (animated, eased fly-to). Tiny island and micro-states get **clickable
   dot-markers** so they're reachable at world scale (including Tuvalu). Click any country
   to open its details.

2. **Rich country details.** A panel for every country with: capital, population (2025)
   and world share, density, median age, fertility rate, urban %, births per day, GDP and
   GDP per person, land & total area and world land share, the Global Peace Index, ISO-2
   and phone codes — plus **2–4 short, kid-friendly "Known for" facts** (landmarks, nature,
   culture). Missing figures show as "—".

3. **Neighbour highlighting.** Selecting a country **outlines its land neighbours** on the
   map (the selected country is filled; neighbours get an amber outline) and lists them in
   the panel under **"Neighbours (N)"** with a count. Each neighbour is **clickable** to hop
   straight to it. Island nations show "no land borders".

4. **Locate on map.** In the Explore detail panel, a **"Locate on map"** button flies the
   map to the country's continent and **pulses** it — answering "where in the world is this?".

5. **Explore by continent.** A sidebar lists the six continents with **live counts**; the
   main area shows clickable **tiles** (flag + name + capital + a small country outline).
   Long names and capitals wrap fully — nothing is truncated.

6. **Search.** Filter the tiles by **country or capital** name as you type.

7. **Quiz — six games.** Guess the **capital**, the **country by flag**, the **country by
   outline**, the **population**, the **continent**, and **"Where in the world?"** — each
   scoped to any continent, with scoring.

8. **"Where in the world?" game.** Read a country name and **click it on the real map**.
   Correct → green; wrong → your pick turns red and the answer is revealed in green with a
   pulse. A round is 8 questions with a final score.

9. **Works offline.** No backend and no runtime fetches — all data is committed static
   JSON, and flags use the bundled `flag-icons` SVG set (so they render on every OS).

10. **Responsive.** Adapts to phones: the country tiles become full-width list rows, the
    detail panel slides in as an overlay, and the quiz options stack to one column.

11. **Shareable deep links.** The URL hash tracks the open tab / continent / country
    (e.g. `#/map/FR`, `#/explore/europe/FR`, `#/quiz`), so links restore the same view.

12. **Ukraine in depth.** A dedicated **Ukraine** tab with an **EN/UA toggle**: a clickable
    map of the 25 regions (oblasts) drills into a collapsible Region → District → Hromada →
    Settlement tree (29,582 places, 2001-census population) with settlement search. The large
    data loads only when the tab is opened.

13. **Bilingual (English / Ukrainian).** A global EN/UA toggle (auto-detected from the
    browser, saved): the whole interface, continent names, country **names and capitals**, and
    number formatting switch language. (The "Known for" facts are still English.)

### Run locally

Requires Node 22+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build
```

> It's a bundled app, so opening `dist/index.html` straight off disk won't work
> (browsers block module scripts over `file://`). Use `npm run dev`, `npm run preview`,
> or host the `dist/` folder.

### How the data works

The country figures come from `data.xlsx`. Generator scripts turn the sources into the
static JSON the app reads (run only when you change the inputs):

```bash
npm run data       # data.xlsx → src/data/countries.json (cleans, fixes, merges facts + neighbours)
npm run shapes     # Natural Earth → src/data/shapes.json (per-country tile outlines)
npm run worldmap   # Natural Earth → src/data/worldmap.json (single-projection clickable map)
npm run neighbors  # world-countries → src/data/neighbors.json (land borders)
```

- Edit **`src/data/facts.json`** (keyed by ISO-2) to change the "Known for" facts, then
  re-run `npm run data`.
- The pipeline **fixes source bugs** (the spreadsheet labels every Caribbean state as
  "Oceania"; capitals like `Jakarta[9]` and Nauru/`Yaren` are corrected).
- Coverage gaps shown as "—": births/day 99/195, peace index 160/195, GDP-per-capita 17
  small states, outlines 194/195 (Tuvalu).

### Deploy to GitHub Pages

Push to `main`; the included GitHub Actions workflow runs `npm ci && npm run build` and
publishes `dist/`. In **Settings → Pages**, set **Source = GitHub Actions**. The Vite
`base` is `'./'` and routing is hash-based, so the site works under any project sub-path.

### Project structure

```
data.xlsx                 source spreadsheet
scripts/                  data generators (build_data.py, build_shapes/worldmap/neighbors.mjs)
src/
  data/                   generated JSON (countries, shapes, worldmap, neighbors) + editable facts.json
  components/             WorldMap, FindGame, Sidebar, CountryCard, CountryDetail, CountryShape, Quiz, Flag
  lib/                    continents metadata + number formatting
  App.tsx                 layout, search, tabs, hash routing
```

---

## 🇺🇦 Українська

World Explorer — це статичний вебзастосунок для вивчення географії з дітьми. Працює
повністю офлайн (усі дані — вбудований JSON, прапори — локальні SVG) і деплоїться на
GitHub Pages без сервера. Має три вкладки — **Map**, **Explore** і **Quiz**, які
ділять спільну панель деталей країни.

### Можливості (Features)

1. **Інтерактивна карта світу.** Справжня проєкція `geoEqualEarth` усіх 195 країн,
   розфарбованих за континентами. **Перетягуй** для панорамування, **колесо або щипок** —
   зум (до точки під курсором), **подвійний клік/тап** — наближення, або одразу перейди до
   континенту кнопками (плавний анімований приліт). Крихітні острівні та мікродержави
   мають **клікабельні маркери-крапки**, щоб їх можна було дістати на масштабі світу
   (зокрема Тувалу). Клік по країні відкриває її деталі.

2. **Детальна інформація про країну.** Панель для кожної країни: столиця, населення
   (2025) і частка у світі, густота, медіанний вік, народжуваність, % міського населення,
   народжень на день, ВВП і ВВП на людину, площа суші й загальна площа та частка світу,
   Глобальний індекс миру, коди ISO-2 і телефонний — плюс **2–4 короткі дитячі факти
   "Known for"** (пам'ятки, природа, культура). Відсутні цифри показані як "—".

3. **Підсвітка сусідів.** При виборі країни її **сухопутні сусіди обводяться** на карті
   (вибрана країна зафарбована, сусіди — бурштиновий контур) і перелічені в панелі під
   **"Neighbours (N)"** з лічильником. Кожен сусід **клікабельний** — переходиш одразу до
   нього. Острівні держави показують "no land borders".

4. **Locate on map.** У панелі деталей вкладки Explore кнопка **"Locate on map"**
   перелітає до континенту країни і **пульсує** нею — відповідь на питання «а де це?».

5. **Огляд за континентами.** Бічна панель перелічує шість континентів із **лічильниками**;
   у головній області — клікабельні **плитки** (прапор + назва + столиця + контур країни).
   Довгі назви й столиці переносяться повністю — нічого не обрізається.

6. **Пошук.** Фільтрування плиток за назвою **країни або столиці** під час набору.

7. **Квіз — шість ігор.** Вгадай **столицю**, **країну за прапором**, **країну за
   контуром**, **населення**, **континент** і **"Where in the world?"** — з вибором
   регіону та підрахунком очок.

8. **Гра "Where in the world?".** Читаєш назву країни і **клікаєш її на справжній карті**.
   Влучив → зелений; промах → твій вибір червоний, а правильна підсвічується зеленим із
   пульсом. Раунд — 8 питань із фінальним рахунком.

9. **Працює офлайн.** Без сервера й без запитів під час роботи — усі дані вбудовані як
   статичний JSON, а прапори беруться з локального набору `flag-icons` (рендеряться на
   будь-якій ОС).

10. **Адаптивність.** Підлаштовується під телефони: плитки країн стають рядками на всю
    ширину, панель деталей висувається оверлеєм, опції квізу — в одну колонку.

11. **Посилання, якими можна ділитися.** Хеш URL зберігає відкриту вкладку / континент /
    країну (напр. `#/map/FR`, `#/explore/europe/FR`, `#/quiz`) — посилання відновлює той
    самий вигляд.

12. **Україна детально.** Окрема вкладка **Ukraine** з перемикачем **EN/UA**: клікабельна
    карта 25 областей провалюється в згорнуте дерево Область → Район → Громада → Населений
    пункт (29 582 пункти, перепис 2001) з пошуком. Великі дані вантажаться лише при відкритті
    вкладки.

13. **Двомовність (English / Українська).** Глобальний перемикач EN/UA (визначається за
    браузером і зберігається): увесь інтерфейс, назви континентів, **назви країн і столиці**
    та формат чисел змінюють мову. (Факти «Known for» поки англійською.)

### Запуск локально

Потрібен Node 22+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # перевірка типів + продакшн-білд → dist/
npm run preview    # віддати продакшн-білд
```

> Це зібраний застосунок, тож відкрити `dist/index.html` напряму з диска не вийде
> (браузери блокують модульні скрипти через `file://`). Використовуй `npm run dev`,
> `npm run preview` або хостинг теки `dist/`.

### Як працюють дані

Цифри по країнах беруться з `data.xlsx`. Скрипти-генератори перетворюють джерела на
статичний JSON, який читає застосунок (запускати лише при зміні вхідних даних):

```bash
npm run data       # data.xlsx → src/data/countries.json (чистить, виправляє, додає факти + сусідів)
npm run shapes     # Natural Earth → src/data/shapes.json (контури країн для плиток)
npm run worldmap   # Natural Earth → src/data/worldmap.json (єдина проєкція клікабельної карти)
npm run neighbors  # world-countries → src/data/neighbors.json (сухопутні кордони)
```

- Редагуй **`src/data/facts.json`** (ключ — ISO-2), щоб змінити факти "Known for", потім
  перезапусти `npm run data`.
- Пайплайн **виправляє помилки джерела** (таблиця позначає всі країни Карибів як "Oceania";
  столиці на кшталт `Jakarta[9]` і Науру/`Yaren` виправлено).
- Прогалини в даних показані як "—": народжень/день 99/195, індекс миру 160/195, ВВП на
  людину для 17 малих держав, контури 194/195 (Тувалу).

### Деплой на GitHub Pages

Запуш у `main`; доданий воркфлоу GitHub Actions виконає `npm ci && npm run build` і
опублікує `dist/`. У **Settings → Pages** постав **Source = GitHub Actions**. Vite `base`
дорівнює `'./'`, а маршрутизація — на хешах, тож сайт працює під будь-яким під-шляхом.

### Структура проєкту

```
data.xlsx                 вихідна таблиця
scripts/                  генератори даних (build_data.py, build_shapes/worldmap/neighbors.mjs)
src/
  data/                   згенерований JSON (countries, shapes, worldmap, neighbors) + редагований facts.json
  components/             WorldMap, FindGame, Sidebar, CountryCard, CountryDetail, CountryShape, Quiz, Flag
  lib/                    метадані континентів + форматування чисел
  App.tsx                 розкладка, пошук, вкладки, маршрутизація на хешах
```
