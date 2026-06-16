import { useEffect, useMemo, useRef, useState } from "react";
import mapData from "../data/worldmap.json";
import type { Continent, Country } from "../types";
import { CONTINENTS, continentMeta } from "../lib/continents";

interface MapData {
  w: number;
  h: number;
  land: string[];
  c: Record<string, string>;
  cont: Record<string, number[]>;
  cen: Record<string, number[]>;
  small: string[];
}
const MAP = mapData as MapData;

type Zoom = Continent | "World";
type Box = [number, number, number, number];

const WORLD: Box = [0, 0, MAP.w, MAP.h];

function continentBox(z: Zoom): Box {
  if (z === "World") return WORLD;
  const b = MAP.cont[z];
  if (!b) return WORLD;
  const [x, y, w, h] = b;
  const px = w * 0.14;
  const py = h * 0.14;
  return [x - px, y - py, w + px * 2, h + py * 2];
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function WorldMap({
  countries,
  selectedIso,
  onSelect,
}: {
  countries: Country[];
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}) {
  const byIso = useMemo(() => new Map(countries.map((c) => [c.iso2, c])), [countries]);

  const [zoom, setZoom] = useState<Zoom>(() => {
    const c = selectedIso ? byIso.get(selectedIso) : null;
    return c ? c.continent : "World";
  });
  const [vb, setVb] = useState<Box>(WORLD); // animated viewBox; mounts at world then flies in
  const vbRef = useRef<Box>(vb);
  vbRef.current = vb;
  const raf = useRef<number | undefined>(undefined);

  // smoothly tween the viewBox whenever the zoom target changes
  useEffect(() => {
    const target = continentBox(zoom);
    const start = vbRef.current;
    const t0 = performance.now();
    const dur = 550;
    if (raf.current) cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = easeInOut(t);
      setVb([
        start[0] + (target[0] - start[0]) * e,
        start[1] + (target[1] - start[1]) * e,
        start[2] + (target[2] - start[2]) * e,
        start[3] + (target[3] - start[3]) * e,
      ]);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [zoom]);

  // "find on map": if a freshly selected country is outside the current view, fly to its continent
  useEffect(() => {
    if (!selectedIso) return;
    const cen = MAP.cen[selectedIso];
    const country = byIso.get(selectedIso);
    if (!cen || !country) return;
    const [x, y, w, h] = vbRef.current;
    const inside = cen[0] >= x && cen[0] <= x + w && cen[1] >= y && cen[1] <= y + h;
    if (!inside) setZoom(country.continent);
  }, [selectedIso, byIso]);

  const landEls = useMemo(
    () => MAP.land.map((d, i) => <path key={i} d={d} />),
    []
  );

  const countryEls = useMemo(
    () =>
      Object.entries(MAP.c).map(([iso, d]) => {
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
      }),
    [byIso, selectedIso, onSelect]
  );

  // markers stay a constant size on screen; hidden for the continent you've zoomed into
  const markerR = vb[2] * 0.0045;
  const selCen = selectedIso ? MAP.cen[selectedIso] : null;
  const selMeta = selectedIso ? continentMeta(byIso.get(selectedIso)?.continent ?? "Africa") : null;

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
          viewBox={vb.map((n) => Math.round(n * 10) / 10).join(" ")}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Clickable world map — choose a country"
        >
          <g className="wmap__land">{landEls}</g>
          {countryEls}

          <g className="wmap__markers">
            {MAP.small.map((iso) => {
              const cen = MAP.cen[iso];
              const country = byIso.get(iso);
              if (!cen || !country) return null;
              if (zoom !== "World" && zoom === country.continent) return null; // big enough when zoomed in
              const meta = continentMeta(country.continent);
              const sel = iso === selectedIso;
              return (
                <circle
                  key={iso}
                  cx={cen[0]}
                  cy={cen[1]}
                  r={sel ? markerR * 1.4 : markerR}
                  className="wmap__marker"
                  fill={meta.color}
                  stroke="#ffffff"
                  strokeWidth={1}
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
                </circle>
              );
            })}
          </g>

          {selCen && selMeta && (
            <circle
              className="wmap__halo"
              cx={selCen[0]}
              cy={selCen[1]}
              r={markerR * 2}
              fill="none"
              stroke={selMeta.color}
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
