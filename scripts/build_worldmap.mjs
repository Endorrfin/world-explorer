// build_worldmap.mjs — generate the single-projection clickable world map.
//
// Unlike shapes.json (each country normalized into its own box), this projects
// ALL 195 countries into ONE shared geoEqualEarth space so they form a real map.
// Output src/data/worldmap.json:
//   { w, h, land:[svgPath…], c:{ iso2: svgPath }, cont:{ Continent:[x,y,w,h] } }
//   - land = territory base layer (gray, non-clickable), Antarctica excluded
//   - c    = the 195 clickable countries
//   - cont = per-continent bounding box for "zoom to continent"
//
// Run:  npm run worldmap     (= node scripts/build_worldmap.mjs)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { geoEqualEarth, geoPath } from "d3-geo";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const req = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf-8"));

const t110 = req("node_modules/world-atlas/countries-110m.json");
const t50 = req("node_modules/world-atlas/countries-50m.json");
const world = req("node_modules/world-countries/countries.json");
const countries = req("src/data/countries.json");

const num2iso = new Map(world.map((c) => [Number(c.ccn3), c.cca2]));
const iso2cont = new Map(countries.map((c) => [c.iso2, c.continent]));
const want = new Set(countries.map((c) => c.iso2));
const fc110 = feature(t110, t110.objects.countries);
const fc50 = feature(t50, t50.objects.countries);

const W = 980, H = 500;
const ours = fc110.features.filter((f) => want.has(num2iso.get(Number(f.id))));
const proj = geoEqualEarth().fitSize([W, H], { type: "FeatureCollection", features: ours });
const path = geoPath(proj);
const round = (d) => d.replace(/-?\d+\.\d+/g, (m) => Math.round(+m));

// Samoa & Tonga sit just past the antimeridian (far left edge) — keep them on the
// map but exclude from Oceania's zoom box so it frames the Australia cluster.
const EXTRA_SKIP = new Set(["WS", "TO"]);
const c = {};
const bounds = {};
function addBounds(iso, f) {
  const cont = iso2cont.get(iso);
  if (!cont || EXTRA_SKIP.has(iso)) return;
  const [[x0, y0], [x1, y1]] = path.bounds(f);
  if (x1 - x0 > 0.45 * W || y1 - y0 > 0.6 * H) return; // skip antimeridian / transcontinental giants
  const b = bounds[cont] || [1e9, 1e9, -1e9, -1e9];
  bounds[cont] = [Math.min(b[0], x0), Math.min(b[1], y0), Math.max(b[2], x1), Math.max(b[3], y1)];
}

for (const f of ours) {
  const iso = num2iso.get(Number(f.id));
  const d = path(f);
  if (d) { c[iso] = round(d); addBounds(iso, f); }
}
for (const f of fc50.features) { // fill micro-states 110m drops
  const iso = num2iso.get(Number(f.id));
  if (!want.has(iso) || c[iso]) continue;
  const d = path(f);
  if (d) { c[iso] = round(d); addBounds(iso, f); }
}

const land = [];
for (const f of fc110.features) {
  const iso = num2iso.get(Number(f.id));
  if (want.has(iso) || Number(f.id) === 10) continue; // skip the 195 (drawn above) and Antarctica
  const d = path(f);
  if (d) land.push(round(d));
}

const cont = {};
for (const k in bounds) {
  const [x0, y0, x1, y1] = bounds[k];
  cont[k] = [Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0)];
}

writeFileSync(join(ROOT, "src/data/worldmap.json"), JSON.stringify({ w: W, h: H, land, c, cont }));
const kb = (readFileSync(join(ROOT, "src/data/worldmap.json")).length / 1024).toFixed(0);
const missing = countries.filter((x) => !c[x.iso2]).map((x) => x.name);
console.log(`wrote ${Object.keys(c).length}/195 countries + ${land.length} base shapes -> src/data/worldmap.json (${kb} KB)`);
if (missing.length) console.log(`no shape at this resolution: ${missing.join(", ")}`);
