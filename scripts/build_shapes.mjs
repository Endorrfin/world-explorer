// build_shapes.mjs — generate normalized country silhouettes for the tiles.
//
// Reads the world-atlas TopoJSON, maps each country's numeric code to its ISO-2
// code (via world-countries), and projects it with an azimuthal-equal-area
// projection centred on the country, so every silhouette is undistorted and
// fills a 100x100 box. Writes src/data/shapes.json  { iso2: svgPath }.
//
// Two passes: the coarse 110m set covers the large countries cheaply; the finer
// 50m set then fills in the small island/micro states that 110m drops.
//
// Run:  npm run shapes     (= node scripts/build_shapes.mjs)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { geoAzimuthalEqualArea, geoCentroid, geoPath } from "d3-geo";
import { reassignCrimeaToUkraine } from "./lib_crimea.mjs"; // CHANGED: Crimea -> Ukraine (UNGA 68/262)

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const req = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf-8"));

const world = req("node_modules/world-countries/countries.json");
const countries = req("src/data/countries.json");
const numToIso2 = new Map(world.map((c) => [Number(c.ccn3), c.cca2]));
const wanted = new Set(countries.map((c) => c.iso2));

const round = (d) => d.replace(/-?\d+\.\d+/g, (m) => (+m).toFixed(1));
const shapes = {};

function addFrom(topoPath, pad) {
  const topo = req(topoPath);
  const fc = feature(topo, topo.objects.countries);
  reassignCrimeaToUkraine(fc); // CHANGED: move Crimea out of Russia into Ukraine
  for (const feat of fc.features) {
    const iso2 = numToIso2.get(Number(feat.id));
    if (!iso2 || !wanted.has(iso2) || shapes[iso2]) continue;
    const c = geoCentroid(feat);
    const proj = geoAzimuthalEqualArea()
      .rotate([-c[0], -c[1]])
      .fitExtent(
        [
          [pad, pad],
          [100 - pad, 100 - pad],
        ],
        feat
      );
    const d = geoPath(proj)(feat);
    if (d) shapes[iso2] = round(d);
  }
}

addFrom("node_modules/world-atlas/countries-110m.json", 4); // large countries
addFrom("node_modules/world-atlas/countries-50m.json", 8); // fill micro states

const ordered = Object.fromEntries(
  Object.keys(shapes).sort().map((k) => [k, shapes[k]])
);
writeFileSync(join(ROOT, "src/data/shapes.json"), JSON.stringify(ordered));

const missing = countries.filter((c) => !shapes[c.iso2]).map((c) => c.name);
const kb = (readFileSync(join(ROOT, "src/data/shapes.json")).length / 1024).toFixed(0);
console.log(`wrote ${Object.keys(shapes).length}/195 shapes -> src/data/shapes.json (${kb} KB)`);
if (missing.length) console.log(`no shape at this resolution (${missing.length}): ${missing.join(", ")}`);
