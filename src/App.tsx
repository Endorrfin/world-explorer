import { useEffect, useMemo, useState } from "react";
import rawData from "./data/countries.json";
import type { Continent, Country, Tab } from "./types";
import { CONTINENT_ORDER } from "./lib/continents";
import { Sidebar, type ContinentFilter } from "./components/Sidebar";
import { CountryCard } from "./components/CountryCard";
import { CountryDetail } from "./components/CountryDetail";
import { Quiz } from "./components/Quiz";

const COUNTRIES = (rawData as unknown as Country[]);

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
  const [tab, contSlug, iso] = h.split("/");
  if (tab === "quiz") return { tab: "quiz", continent: "All", iso: null };
  const continent = contSlug ? continentBySlug(contSlug) ?? "All" : "All";
  return {
    tab: "explore",
    continent,
    iso: iso ? iso.toUpperCase() : null,
  };
}

function writeHash(s: HashState) {
  let h = `#/${s.tab}`;
  if (s.tab === "explore") {
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

  // counts per continent
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
        c.capital.toLowerCase().includes(q)
      );
    });
  }, [continent, query]);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.iso2 === selectedIso) ?? null,
    [selectedIso]
  );

  // keep the URL hash in sync (shareable deep links)
  useEffect(() => {
    writeHash({ tab, continent, iso: selectedIso });
  }, [tab, continent, selectedIso]);

  // respond to browser back/forward
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
            className={`tab${tab === "explore" ? " tab--active" : ""}`}
            onClick={() => setTab("explore")}
            type="button"
          >
            Explore
          </button>
          <button
            className={`tab${tab === "quiz" ? " tab--active" : ""}`}
            onClick={() => setTab("quiz")}
            type="button"
          >
            Quiz
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
              placeholder="Search country or capital…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search countries"
            />
          </div>
        )}
      </header>

      {tab === "explore" ? (
        <div className={`layout${selected ? " layout--detail-open" : ""}`}>
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
                {continent === "All" ? "All countries" : continent}
              </h1>
              <span className="main__count">{filtered.length} countries</span>
            </div>

            {filtered.length === 0 ? (
              <p className="empty">No countries match “{query}”.</p>
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

          <CountryDetail country={selected} onClose={() => setSelectedIso(null)} />
        </div>
      ) : (
        <div className="quiz-wrap">
          <Quiz countries={COUNTRIES} />
        </div>
      )}
    </div>
  );
}
