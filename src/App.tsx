import { useEffect, useMemo, useState } from "react";
import rawData from "./data/countries.json";
import type { Continent, Country, Tab } from "./types";
import { CONTINENT_ORDER } from "./lib/continents";
import {
  LangContext,
  continentLabel,
  detectLang,
  localeOf,
  translate,
  type Lang,
} from "./lib/i18n";
import { setLocale } from "./lib/format";
import { Sidebar, type ContinentFilter } from "./components/Sidebar";
import { CountryCard } from "./components/CountryCard";
import { CountryDetail } from "./components/CountryDetail";
import { WorldMap } from "./components/WorldMap";
import { Quiz } from "./components/Quiz";
import { UkraineTab } from "./components/UkraineTab";
import { AboutTab } from "./components/AboutTab";

const COUNTRIES = rawData as unknown as Country[];

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
const continentBySlug = (s: string): Continent | null =>
  CONTINENT_ORDER.find((c) => slug(c) === s) ?? null;

interface HashState {
  tab: Tab;
  continent: ContinentFilter;
  iso: string | null;
}

function parseHash(): HashState {
  const h = window.location.hash.replace(/^#\/?/, "");
  const [tab, a, b] = h.split("/");
  if (tab === "quiz") return { tab: "quiz", continent: "All", iso: null };
  if (tab === "ukraine") return { tab: "ukraine", continent: "All", iso: null };
  if (tab === "about") return { tab: "about", continent: "All", iso: null };
  if (tab === "map") return { tab: "map", continent: "All", iso: a ? a.toUpperCase() : null };
  if (tab === "explore") {
    const continent = a ? continentBySlug(a) ?? "All" : "All";
    return { tab: "explore", continent, iso: b ? b.toUpperCase() : null };
  }
  return { tab: "map", continent: "All", iso: null }; // default landing
}

function writeHash(s: HashState) {
  let h = `#/${s.tab}`;
  if (s.tab === "map") {
    if (s.iso) h += `/${s.iso}`;
  } else if (s.tab === "explore") {
    h += `/${slug(s.continent)}`;
    if (s.iso) h += `/${s.iso}`;
  }
  if (window.location.hash !== h) {
    history.replaceState(null, "", h);
  }
}

export default function App() {
  const initial = parseHash();
  const [tab, setTab] = useState<Tab>(initial.tab);
  const [continent, setContinent] = useState<ContinentFilter>(initial.continent);
  const [selectedIso, setSelectedIso] = useState<string | null>(initial.iso);
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<Lang>(detectLang());

  setLocale(localeOf(lang)); // keep number formatting in sync (idempotent)
  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = (k: Parameters<typeof translate>[1], p?: Record<string, string | number>) =>
    translate(lang, k, p);

  const counts = useMemo(() => {
    const c = {} as Record<Continent, number>;
    for (const name of CONTINENT_ORDER) c[name] = 0;
    for (const country of COUNTRIES) c[country.continent]++;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter((c) => {
      const inScope = continent === "All" || c.continent === continent;
      if (!inScope) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.nameUk.toLowerCase().includes(q) ||
        c.capitalUk.toLowerCase().includes(q)
      );
    });
  }, [continent, query]);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.iso2 === selectedIso) ?? null,
    [selectedIso]
  );

  const byIso = useMemo(() => new Map(COUNTRIES.map((c) => [c.iso2, c])), []);
  const neighbors = useMemo(
    () => (selected?.neighbors ?? []).map((iso) => byIso.get(iso)).filter(Boolean) as Country[],
    [selected, byIso]
  );

  useEffect(() => {
    writeHash({ tab, continent, iso: selectedIso });
  }, [tab, continent, selectedIso]);

  useEffect(() => {
    const onHash = () => {
      const s = parseHash();
      setTab(s.tab);
      setContinent(s.continent);
      setSelectedIso(s.iso);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <span className="brand__globe" aria-hidden>
              🌍
            </span>
            <span className="brand__name">World Explorer</span>
          </div>

          <nav className="tabs" aria-label="Sections">
            <button
              className={`tab${tab === "map" ? " tab--active" : ""}`}
              onClick={() => setTab("map")}
              type="button"
            >
              {t("tab.map")}
            </button>
            <button
              className={`tab${tab === "explore" ? " tab--active" : ""}`}
              onClick={() => setTab("explore")}
              type="button"
            >
              {t("tab.explore")}
            </button>
            <button
              className={`tab${tab === "quiz" ? " tab--active" : ""}`}
              onClick={() => setTab("quiz")}
              type="button"
            >
              {t("tab.quiz")}
            </button>
            <button
              className={`tab${tab === "ukraine" ? " tab--active" : ""}`}
              onClick={() => setTab("ukraine")}
              type="button"
            >
              🇺🇦 {t("tab.ukraine")}
            </button>
            <button
              className={`tab${tab === "about" ? " tab--active" : ""}`}
              onClick={() => setTab("about")}
              type="button"
            >
              {t("tab.about")}
            </button>
          </nav>

          {tab === "explore" && (
            <div className="search">
              <span className="search__icon" aria-hidden>
                🔎
              </span>
              <input
                className="search__input"
                type="search"
                placeholder={t("search.placeholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t("search.placeholder")}
              />
              {/* CHANGED: explicit clear button, visible only when query is non-empty */}
              {query && (
                <button
                  type="button"
                  className="search__clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="langtoggle" role="group" aria-label="Language">
            <button
              type="button"
              className={`langbtn${lang === "en" ? " langbtn--on" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`langbtn${lang === "uk" ? " langbtn--on" : ""}`}
              onClick={() => setLang("uk")}
            >
              UA
            </button>
          </div>
        </header>

        {tab === "map" && (
          <div className={`maplayout${selected ? " maplayout--detail-open" : ""}`}>
            {/* CHANGED: mobile backdrop closes panel on tap */}
            {selected && <div className="detail-backdrop" onClick={() => setSelectedIso(null)} aria-hidden />}
            <WorldMap
              countries={COUNTRIES}
              selectedIso={selectedIso}
              onSelect={(iso) => setSelectedIso(iso)}
              showNeighbors
            />
            <CountryDetail
              country={selected}
              onClose={() => setSelectedIso(null)}
              neighbors={neighbors}
              onSelectNeighbor={(iso) => setSelectedIso(iso)}
            />
          </div>
        )}

        {tab === "explore" && (
          <div className={`layout${selected ? " layout--detail-open" : ""}`}>
            {/* CHANGED: mobile backdrop */}
            {selected && <div className="detail-backdrop" onClick={() => setSelectedIso(null)} aria-hidden />}
            <Sidebar
              counts={counts}
              total={COUNTRIES.length}
              selected={continent}
              onSelect={(c) => {
                setContinent(c);
                setSelectedIso(null);
              }}
            />

            <main className="main">
              <div className="main__head">
                <h1 className="main__title">
                  {continent === "All" ? t("main.all") : continentLabel(lang, continent)}
                </h1>
                <span className="main__count">
                  {filtered.length} {t("unit.countries")}
                </span>
              </div>

              {filtered.length === 0 ? (
                <p className="empty">
                  {t("empty.noMatch")} “{query}”.
                </p>
              ) : (
                <div className="grid">
                  {filtered.map((c) => (
                    <CountryCard
                      key={c.iso2}
                      country={c}
                      selected={c.iso2 === selectedIso}
                      onSelect={(x) => setSelectedIso(x.iso2)}
                    />
                  ))}
                </div>
              )}
            </main>

            <CountryDetail
              country={selected}
              onClose={() => setSelectedIso(null)}
              onLocate={() => setTab("map")}
              neighbors={neighbors}
              onSelectNeighbor={(iso) => setSelectedIso(iso)}
            />
          </div>
        )}

        {tab === "quiz" && (
          <div className="quiz-wrap">
            <Quiz countries={COUNTRIES} />
          </div>
        )}

        {tab === "ukraine" && (
          <div className="uk-wrap">
            <UkraineTab />
          </div>
        )}

        {tab === "about" && (
          <div className="about-wrap">
            <AboutTab />
          </div>
        )}
      </div>
    </LangContext.Provider>
  );
}
