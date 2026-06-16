// build_neighbors.mjs — land-border (neighbour) lists for each country.
//
// Reads the `borders` field from world-countries (ISO-3 codes), maps them to
// ISO-2, keeps only the 195 in our set, and writes src/data/neighbors.json
//   { iso2: [neighbourIso2, …] }   (empty array = island / no land borders)
//
// build_data.py merges this into countries.json as the `neighbors` field.
//
// Run:  npm run neighbors     (= node scripts/build_neighbors.mjs)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const req = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf-8"));

const world = req("node_modules/world-countries/countries.json");
const countries = req("src/data/countries.json");

const want = new Set(countries.map((c) => c.iso2));
const cca3to2 = new Map(world.map((c) => [c.cca3, c.cca2]));
const byCca2 = new Map(world.map((c) => [c.cca2, c]));

const out = {};
for (const c of countries) {
  const w = byCca2.get(c.iso2);
  const borders = (w?.borders || [])
    .map((b) => cca3to2.get(b))
    .filter((x) => x && want.has(x));
  out[c.iso2] = [...new Set(borders)].sort();
}

writeFileSync(join(ROOT, "src/data/neighbors.json"), JSON.stringify(out));
const withNb = Object.values(out).filter((a) => a.length).length;
console.log(`wrote neighbours for ${Object.keys(out).length} countries (${withNb} have land borders) -> src/data/neighbors.json`);
