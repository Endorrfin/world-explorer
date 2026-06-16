import { useMemo, useState } from "react";
import mapData from "../data/worldmap.json";
import type { Continent, Country } from "../types";
import { CONTINENTS, continentMeta } from "../lib/continents";

interface MapData {
  w: number;
  h: number;
  land: string[];
  c: Record<string, string>;
  cont: Record<string, number[]>;
}
const MAP = mapData as MapData;

type Zoom = Continent | "World";

export function WorldMap({
  countries,
  selectedIso,
  onSelect,
}: {
  countries: Country[];
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}) {
  const [zoom, setZoom] = useState<Zoom>("World");
  const byIso = useMemo(
    () => new Map(countries.map((c) => [c.iso2, c])),
    [countries]
  );

  // zoom by snapping the SVG viewBox to a continent's bounding box (+ padding)
  const viewBox = useMemo(() => {
    if (zoom === "World") return `0 0 ${MAP.w} ${MAP.h}`;
    const b = MAP.cont[zoom];
    if (!b) return `0 0 ${MAP.w} ${MAP.h}`;
    const [x, y, w, h] = b;
    const px = w * 0.14;
    const py = h * 0.14;
    return `${x - px} ${y - py} ${w + px * 2} ${h + py * 2}`;
  }, [zoom]);

  const entries = useMemo(() => Object.entries(MAP.c), []);

  return (
    <div className="wmap">
      <div className="wmap__zooms" role="group" aria-label="Zoom to continent">
        <button
          type="button"
          className={`wmap__zoom${zoom === "World" ? " wmap__zoom--on" : ""}`}
          onClick={() => setZoom("World")}
        >
          🌍 World
        </button>
        {CONTINENTS.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`wmap__zoom${zoom === c.name ? " wmap__zoom--on" : ""}`}
            style={zoom === c.name ? { borderColor: c.color, background: c.tint } : undefined}
            onClick={() => setZoom(c.name)}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div className="wmap__frame">
        <svg
          className="wmap__svg"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Clickable world map — choose a country"
        >
          <g className="wmap__land">
            {MAP.land.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          {entries.map(([iso, d]) => {
            const country = byIso.get(iso);
            if (!country) return null;
            const meta = continentMeta(country.continent);
            const sel = iso === selectedIso;
            return (
              <path
                key={iso}
                d={d}
                className={`wmap__country${sel ? " wmap__country--sel" : ""}`}
                fill={meta.color}
                fillOpacity={sel ? 0.92 : 0.5}
                stroke={sel ? meta.color : "#ffffff"}
                strokeWidth={sel ? 1.4 : 0.5}
                vectorEffect="non-scaling-stroke"
                tabIndex={0}
                role="button"
                aria-label={country.name}
                onClick={() => onSelect(iso)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(iso);
                  }
                }}
              >
                <title>{country.name}</title>
              </path>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
