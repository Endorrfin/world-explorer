import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapData from "../data/worldmap.json";
import type { Continent, Country } from "../types";
import { CONTINENTS, continentMeta } from "../lib/continents";
import { continentLabel, useLang, useT } from "../lib/i18n";

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
const MINW = 90; // most zoomed-in (smallest viewBox width)
const MAXW = MAP.w; // world view

function continentBox(z: Zoom): Box {
  if (z === "World") return WORLD;
  const b = MAP.cont[z];
  if (!b) return WORLD;
  const [x, y, w, h] = b;
  const px = w * 0.14;
  const py = h * 0.14;
  return [x - px, y - py, w + px * 2, h + py * 2];
}

function clampPos(b: Box): Box {
  const [, , w, h] = b;
  const ox = MAP.w * 0.08;
  const oy = MAP.h * 0.08;
  const x = Math.min(MAP.w + ox - w, Math.max(-ox, b[0]));
  const y = Math.min(MAP.h + oy - h, Math.max(-oy, b[1]));
  return [x, y, w, h];
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const FB: Record<string, { fill: string; stroke: string }> = {
  correct: { fill: "#2f9e69", stroke: "#1e7a4f" },
  wrong: { fill: "#d2544a", stroke: "#a83a32" },
};
const EMPTY_FEEDBACK: Record<string, "correct" | "wrong"> = {};

export function WorldMap({
  countries,
  selectedIso,
  onSelect,
  feedback = EMPTY_FEEDBACK,
  forceMarkers = false,
  initialZoom = "World",
  showNeighbors = false,
}: {
  countries: Country[];
  selectedIso: string | null;
  onSelect: (iso: string) => void;
  feedback?: Record<string, "correct" | "wrong">;
  forceMarkers?: boolean;
  initialZoom?: Zoom;
  showNeighbors?: boolean;
}) {
  const byIso = useMemo(() => new Map(countries.map((c) => [c.iso2, c])), [countries]);
  const t = useT();
  const { lang } = useLang();

  const neighborSet = useMemo(() => {
    if (!showNeighbors || !selectedIso) return new Set<string>();
    return new Set(byIso.get(selectedIso)?.neighbors ?? []);
  }, [showNeighbors, selectedIso, byIso]);

  const [active, setActive] = useState<Zoom | null>(initialZoom); // highlighted button, or null when freely navigated
  const [vb, setVb] = useState<Box>(WORLD);
  const vbRef = useRef<Box>(vb);
  vbRef.current = vb;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const raf = useRef<number | undefined>(undefined);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panLast = useRef<{ x: number; y: number } | null>(null);
  const pinchPrev = useRef<number | null>(null);
  const downPos = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const mounted = useRef(false);

  const stopAnim = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  };

  // animated fly-to a target box (continent buttons, Locate, deep links)
  const flyTo = useCallback((target: Box, activeName: Zoom | null) => {
    stopAnim();
    setActive(activeName);
    const start = vbRef.current;
    const t0 = performance.now();
    const dur = 550;
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
  }, []);

  // screen → user (viewBox) coordinates, honouring preserveAspectRatio
  const userPoint = useCallback((clientX: number, clientY: number): [number, number] => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return [0, 0];
    return [(clientX - ctm.e) / ctm.a, (clientY - ctm.f) / ctm.d];
  }, []);

  // zoom by a factor around a user-space point (wheel / pinch / double-click)
  const zoomAt = useCallback((factor: number, ux: number, uy: number) => {
    stopAnim();
    setActive(null);
    setVb((prev) => {
      let nw = prev[2] * factor;
      nw = Math.min(MAXW, Math.max(MINW, nw));
      const s = nw / prev[2];
      const nh = prev[3] * s;
      const nx = ux - (ux - prev[0]) * s;
      const ny = uy - (uy - prev[1]) * s;
      return clampPos([nx, ny, nw, nh]);
    });
  }, []);

  // fly to the selected country's continent on open (Locate / deep link)
  useEffect(() => {
    if (selectedIso) {
      const c = byIso.get(selectedIso);
      if (c) flyTo(continentBox(c.continent), c.continent);
    } else if (initialZoom !== "World") {
      flyTo(continentBox(initialZoom), initialZoom);
    }
    mounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // later: if a freshly selected country is off-screen, fly to its continent
  useEffect(() => {
    if (!mounted.current || !selectedIso) return;
    const c = byIso.get(selectedIso);
    const cen = MAP.cen[selectedIso];
    if (!c || !cen) return;
    const [x, y, w, h] = vbRef.current;
    const inside = cen[0] >= x && cen[0] <= x + w && cen[1] >= y && cen[1] <= y + h;
    if (!inside) flyTo(continentBox(c.continent), c.continent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIso]);

  // wheel zoom needs a non-passive listener to preventDefault page scroll
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const [ux, uy] = userPoint(e.clientX, e.clientY);
      zoomAt(e.deltaY > 0 ? 1.12 : 0.89, ux, uy);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [userPoint, zoomAt]);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // NOTE: do NOT capture the pointer here, or a plain click on a country path
    // never fires. Capture only starts once an actual drag begins (see move).
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      downPos.current = { x: e.clientX, y: e.clientY };
      panLast.current = { x: e.clientX, y: e.clientY };
      dragged.current = false;
    } else if (pointers.current.size === 2) {
      const p = [...pointers.current.values()];
      pinchPrev.current = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      panLast.current = null;
      dragged.current = true;
      stopAnim();
      setActive(null);
      svgRef.current?.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1 && panLast.current) {
      if (!dragged.current) {
        const d0 = downPos.current;
        const moved = d0 ? Math.hypot(e.clientX - d0.x, e.clientY - d0.y) : 0;
        if (moved < 4) return; // still a click, not a drag
        dragged.current = true;
        stopAnim();
        setActive(null);
        svgRef.current?.setPointerCapture(e.pointerId);
      }
      const ctm = svgRef.current?.getScreenCTM();
      if (!ctm) return;
      const dx = (e.clientX - panLast.current.x) / ctm.a;
      const dy = (e.clientY - panLast.current.y) / ctm.d;
      panLast.current = { x: e.clientX, y: e.clientY };
      setVb((prev) => clampPos([prev[0] - dx, prev[1] - dy, prev[2], prev[3]]));
    } else if (pointers.current.size === 2) {
      const p = [...pointers.current.values()];
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      const mx = (p[0].x + p[1].x) / 2;
      const my = (p[0].y + p[1].y) / 2;
      if (pinchPrev.current && d > 0) {
        const [ux, uy] = userPoint(mx, my);
        zoomAt(pinchPrev.current / d, ux, uy);
      }
      pinchPrev.current = d;
    }
  };

  const endPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchPrev.current = null;
    if (pointers.current.size === 1) {
      const p = [...pointers.current.values()][0];
      panLast.current = { x: p.x, y: p.y };
    } else if (pointers.current.size === 0) {
      panLast.current = null;
    }
  };

  const onDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const [ux, uy] = userPoint(e.clientX, e.clientY);
    zoomAt(0.55, ux, uy);
  };

  const landEls = useMemo(() => MAP.land.map((d, i) => <path key={i} d={d} />), []);

  const countryEls = useMemo(
    () =>
      Object.entries(MAP.c).map(([iso, d]) => {
        const country = byIso.get(iso);
        if (!country) return null;
        const meta = continentMeta(country.continent);
        const sel = iso === selectedIso;
        const fb = feedback[iso];
        return (
          <path
            key={iso}
            d={d}
            className={`wmap__country${sel ? " wmap__country--sel" : ""}`}
            fill={fb ? FB[fb].fill : meta.color}
            fillOpacity={fb ? 0.9 : sel ? 0.92 : 0.5}
            stroke={fb ? FB[fb].stroke : sel ? meta.color : "#ffffff"}
            strokeWidth={fb || sel ? 1.4 : 0.5}
            vectorEffect="non-scaling-stroke"
            tabIndex={0}
            role="button"
            aria-label={country.name}
            onClick={() => {
              if (!dragged.current) onSelect(iso);
            }}
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
    [byIso, selectedIso, onSelect, feedback]
  );

  const markerR = vb[2] * 0.0045;
  const showMarkers = forceMarkers || vb[2] > MAP.w * 0.5; // only while zoomed out
  const selCen = selectedIso ? MAP.cen[selectedIso] : null;
  const selMeta = selectedIso ? continentMeta(byIso.get(selectedIso)?.continent ?? "Africa") : null;

  return (
    <div className="wmap">
      <div className="wmap__zooms" role="group" aria-label="Zoom to continent">
        <button
          type="button"
          className={`wmap__zoom${active === "World" ? " wmap__zoom--on" : ""}`}
          onClick={() => flyTo(WORLD, "World")}
        >
          {t("map.world")}
        </button>
        {CONTINENTS.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`wmap__zoom${active === c.name ? " wmap__zoom--on" : ""}`}
            style={active === c.name ? { borderColor: c.color, background: c.tint } : undefined}
            onClick={() => flyTo(continentBox(c.name), c.name)}
          >
            {c.emoji} {continentLabel(lang, c.name)}
          </button>
        ))}
      </div>

      <div className="wmap__frame">
        <svg
          ref={svgRef}
          className="wmap__svg"
          viewBox={vb.map((n) => Math.round(n * 10) / 10).join(" ")}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Clickable world map — drag to pan, scroll to zoom, click a country"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onDoubleClick={onDoubleClick}
        >
          <g className="wmap__land">{landEls}</g>
          {countryEls}

          {neighborSet.size > 0 && (
            <g className="wmap__nb" pointerEvents="none">
              {[...neighborSet].map((iso) => {
                const d = MAP.c[iso];
                return d ? (
                  <path
                    key={iso}
                    d={d}
                    fill="none"
                    stroke="#c2710a"
                    strokeWidth={1.7}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null;
              })}
            </g>
          )}

          {showMarkers && (
            <g className="wmap__markers">
              {MAP.small.map((iso) => {
                const cen = MAP.cen[iso];
                const country = byIso.get(iso);
                if (!cen || !country) return null;
                const meta = continentMeta(country.continent);
                const sel = iso === selectedIso;
                const fb = feedback[iso];
                return (
                  <circle
                    key={iso}
                    cx={cen[0]}
                    cy={cen[1]}
                    r={sel || fb ? markerR * 1.5 : markerR}
                    className="wmap__marker"
                    fill={fb ? FB[fb].fill : meta.color}
                    stroke={fb ? FB[fb].stroke : "#ffffff"}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    tabIndex={0}
                    role="button"
                    aria-label={country.name}
                    onClick={() => {
              if (!dragged.current) onSelect(iso);
            }}
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
          )}

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

      <p className="wmap__hint">{t("map.hint")}</p>
    </div>
  );
}
