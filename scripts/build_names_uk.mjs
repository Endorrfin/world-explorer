// build_names_uk.mjs — Ukrainian country names (ISO-2 → name).
//
// Source: i18n-iso-countries (uk locale) + a few kid-friendly short-form overrides
// to match the English short names (Південна/Північна Корея, ДР Конго, Велика Британія…).
// build_data.py merges the result into countries.json as the `nameUk` field.
// (Capitals are hand-curated in src/data/capitals_uk.json.)
//
// One-off:  npm i i18n-iso-countries   (small; NOT a committed dep)
// Run:      npm run namesuk
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const iso = require("i18n-iso-countries");
iso.registerLocale(require("i18n-iso-countries/langs/uk.json"));

const countries = JSON.parse(readFileSync(join(ROOT, "src/data/countries.json"), "utf-8"));
const names = iso.getNames("uk");
const OVERRIDE = {
  GB: "Велика Британія",
  KR: "Південна Корея",
  KP: "Північна Корея",
  CD: "ДР Конго",
  CG: "Республіка Конго",
  CI: "Кот-д'Івуар",
  BN: "Бруней",
};

const out = {};
for (const c of countries) out[c.iso2] = OVERRIDE[c.iso2] || names[c.iso2] || c.name;
writeFileSync(join(ROOT, "src/data/names_uk.json"), JSON.stringify(out));
console.log(`wrote ${Object.keys(out).length} Ukrainian country names -> src/data/names_uk.json`);
