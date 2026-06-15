import { CONTINENTS, continentMeta } from "../lib/continents";
import type { Continent } from "../types";

export type ContinentFilter = Continent | "All";

export function Sidebar({
  counts,
  total,
  selected,
  onSelect,
}: {
  counts: Record<Continent, number>;
  total: number;
  selected: ContinentFilter;
  onSelect: (c: ContinentFilter) => void;
}) {
  return (
    <nav className="sidebar" aria-label="Continents">
      <h2 className="sidebar__title">Continents</h2>

      <button
        type="button"
        className={`continent${selected === "All" ? " continent--active" : ""}`}
        onClick={() => onSelect("All")}
      >
        <span className="continent__icon" aria-hidden>
          🌍
        </span>
        <span className="continent__name">All countries</span>
        <span className="continent__count">{total}</span>
      </button>

      {CONTINENTS.map((c) => {
        const meta = continentMeta(c.name);
        const active = selected === c.name;
        return (
          <button
            key={c.name}
            type="button"
            className={`continent${active ? " continent--active" : ""}`}
            onClick={() => onSelect(c.name)}
            style={
              active
                ? { borderColor: meta.color, background: meta.tint }
                : undefined
            }
          >
            <span className="continent__icon" aria-hidden>
              {c.emoji}
            </span>
            <span className="continent__name">{c.name}</span>
            <span
              className="continent__count"
              style={{ background: meta.color }}
            >
              {counts[c.name] ?? 0}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
