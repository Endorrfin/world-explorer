import { useEffect, useMemo, useState } from "react";

type Lang = "ua" | "en";

interface UNode {
  id: number;
  name: string;
  depth: number;
  pop: number;
  count: number;
  children?: UNode[];
}
interface Prepared {
  root: UNode;
  leaves: { name: string; path: string; pop: number }[];
}

interface RawNode {
  name: string;
  value?: string | number;
  children?: RawNode[];
}

const LEVEL_COLORS = ["#2c3e50", "#3498db", "#e74c3c", "#f39c12", "#27ae60"];
const LEVEL_LABELS: Record<Lang, string[]> = {
  en: ["Country", "Region", "District", "Hromada", "Settlement"],
  ua: ["Країна", "Область", "Район", "Громада", "Нас. пункт"],
};

const T = {
  en: {
    title: "Populated places of Ukraine",
    sub: "Region → District → Hromada → Settlement · population, 2001 census",
    search: "Search a settlement…",
    collapse: "Collapse all",
    loading: "Loading…",
    error: "Could not load the data.",
    pop: "Population 2001",
    count: "Count",
    found: "found",
  },
  ua: {
    title: "Населені пункти України",
    sub: "Область → Район → Громада → Населений пункт · населення за переписом 2001",
    search: "Пошук населеного пункту…",
    collapse: "Згорнути все",
    loading: "Завантаження…",
    error: "Не вдалося завантажити дані.",
    pop: "Населення 2001",
    count: "К-сть",
    found: "знайдено",
  },
};

function prepare(raw: RawNode): Prepared {
  let id = 0;
  const leaves: Prepared["leaves"] = [];
  function walk(n: RawNode, depth: number, anc: string[]): UNode {
    const node: UNode = { id: id++, name: n.name, depth, pop: 0, count: 0 };
    if (n.children && n.children.length) {
      const childAnc = depth === 0 ? [] : [...anc, n.name];
      node.children = n.children.map((c) => walk(c, depth + 1, childAnc));
      node.pop = node.children.reduce((s, c) => s + c.pop, 0);
      node.count = node.children.reduce((s, c) => s + c.count, 0);
    } else {
      node.pop = Number(n.value) || 0;
      node.count = 1;
      leaves.push({ name: n.name, path: anc.join(" › "), pop: node.pop });
    }
    return node;
  }
  return { root: walk(raw, 0, []), leaves };
}

// module-level cache so switching away and back doesn't refetch
const cache: Partial<Record<Lang, Prepared>> = {};

export function UkraineTab() {
  const [lang, setLang] = useState<Lang>("ua");
  const [data, setData] = useState<Prepared | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (cache[lang]) {
      setData(cache[lang]!);
      setExpanded(new Set([cache[lang]!.root.id]));
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);
    const file = lang === "ua" ? "ukraine_ua.json" : "ukraine_eng.json";
    fetch(import.meta.env.BASE_URL + file)
      .then((r) => r.json())
      .then((raw: RawNode) => {
        if (cancelled) return;
        const p = prepare(raw);
        cache[lang] = p;
        setData(p);
        setExpanded(new Set([p.root.id]));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const t = T[lang];
  const fmt = (n: number) => n.toLocaleString(lang === "ua" ? "uk-UA" : "en-US");

  const rows = useMemo(() => {
    if (!data) return [];
    const out: UNode[] = [];
    const rec = (n: UNode) => {
      out.push(n);
      if (expanded.has(n.id) && n.children) n.children.forEach(rec);
    };
    rec(data.root);
    return out;
  }, [data, expanded]);

  const results = useMemo(() => {
    if (!data) return null;
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    return data.leaves.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 300);
  }, [data, query]);

  const toggle = (id: number) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const collapseAll = () => data && setExpanded(new Set([data.root.id]));

  return (
    <div className="uk">
      <div className="uk__bar">
        <h2 className="uk__title">🇺🇦 {t.title}</h2>
        <div className="uk__lang" role="group" aria-label="Language">
          <button
            type="button"
            className={`uk__langbtn${lang === "en" ? " uk__langbtn--on" : ""}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={`uk__langbtn${lang === "ua" ? " uk__langbtn--on" : ""}`}
            onClick={() => setLang("ua")}
          >
            UA
          </button>
        </div>
      </div>
      <p className="uk__sub">{t.sub}</p>

      <div className="uk__controls">
        <input
          className="uk__search"
          type="search"
          placeholder={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {!results && (
          <button type="button" className="btn" onClick={collapseAll}>
            {t.collapse}
          </button>
        )}
      </div>

      <div className="uk__legend">
        {LEVEL_LABELS[lang].map((l, i) => (
          <span key={i} className="uk__leg">
            <span className="uk__dot" style={{ background: LEVEL_COLORS[i] }} />
            {l}
          </span>
        ))}
      </div>

      {loading && <p className="uk__msg">{t.loading}</p>}
      {error && <p className="uk__msg">{t.error}</p>}

      {data && results && (
        <div className="uk__tree">
          <div className="uk__rescount">
            {results.length}
            {results.length >= 300 ? "+" : ""} {t.found}
          </div>
          {results.map((r, i) => (
            <div key={i} className="uk__row">
              <span className="uk__namewrap">
                <span className="uk__dot" style={{ background: LEVEL_COLORS[4] }} />
                <span className="uk__name">{r.name}</span>
                <span className="uk__path">{r.path}</span>
              </span>
              <span className="uk__pop">{r.pop ? fmt(r.pop) : "—"}</span>
              <span className="uk__cnt">—</span>
            </div>
          ))}
        </div>
      )}

      {data && !results && (
        <div className="uk__tree">
          <div className="uk__cols">
            <span className="uk__namewrap uk__colname" />
            <span className="uk__pop uk__colh">{t.pop}</span>
            <span className="uk__cnt uk__colh">{t.count}</span>
          </div>
          {rows.map((n) => {
            const hasCh = !!n.children;
            const isExp = expanded.has(n.id);
            const color = LEVEL_COLORS[Math.min(n.depth, 4)];
            return (
              <div key={n.id} className="uk__row">
                <span className="uk__namewrap" style={{ paddingLeft: n.depth * 18 }}>
                  {hasCh ? (
                    <button
                      type="button"
                      className="uk__toggle"
                      style={{ color, borderColor: color }}
                      onClick={() => toggle(n.id)}
                      aria-label={isExp ? "collapse" : "expand"}
                    >
                      {isExp ? "−" : "+"}
                    </button>
                  ) : (
                    <span className="uk__leaf" aria-hidden>
                      <i style={{ background: color }} />
                    </span>
                  )}
                  <span
                    className="uk__name"
                    style={{ color, fontWeight: hasCh ? 600 : 400 }}
                  >
                    {n.name}
                  </span>
                </span>
                <span className="uk__pop">{n.pop ? fmt(n.pop) : "—"}</span>
                <span className="uk__cnt">{hasCh ? fmt(n.count) : "—"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
