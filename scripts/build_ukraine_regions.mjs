// build_ukraine_regions.mjs — clickable map of Ukraine's oblasts (admin-1).
//
// Projects the amCharts low-res Ukraine oblasts (GeoJSON, ISO 3166-2 ids) with a
// Mercator projection and links each oblast to its index in the settlements tree
// (separately for the EN and UA data, whose region orders differ). Writes
// src/data/ukraine_regions.json: { w, h, regions:[{ id, name, ie, iu, d }] }.
//   - ie / iu = index of the matching region in ukraine_eng.json / ukraine_ua.json
//   - Kyiv City (UA-30) and Sevastopol (UA-40) are mapped onto Kyiv / Crimea.
//
// Run:  npm run uaregions   (= node scripts/build_ukraine_regions.mjs)
// One-off first:  npm i @amcharts/amcharts5-geodata   (~340 MB — NOT a committed dep;
// the generated src/data/ukraine_regions.json is committed instead).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { geoMercator, geoPath } from "d3-geo";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const req = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf-8"));

const fc = req("node_modules/@amcharts/amcharts5-geodata/json/ukraineLow.json");
const eng = req("public/ukraine_eng.json").children.map((r) => r.name);
const ua = req("public/ukraine_ua.json").children.map((r) => r.name);

// amCharts oblast id → [EN tree region name, UA tree region name]
const MAP = {
  "UA-05": ["Vinnytska", "Вінницька"], "UA-07": ["Volynska", "Волинська"],
  "UA-09": ["Luhanska", "Луганська"], "UA-12": ["Dnipropetrovska", "Дніпропетровська"],
  "UA-14": ["Donetska", "Донецька"], "UA-18": ["Zhytomyrska", "Житомирська"],
  "UA-21": ["Zakarpatska", "Закарпатська"], "UA-23": ["Zaporizka", "Запорізька"],
  "UA-26": ["Ivano-Frankivska", "Івано-Франківська"], "UA-30": ["Kyivska", "Київська"],
  "UA-32": ["Kyivska", "Київська"], "UA-35": ["Kirovohradska", "Кіровоградська"],
  "UA-40": ["AR of Crimea", "АР Крим"], "UA-43": ["AR of Crimea", "АР Крим"],
  "UA-46": ["Lvivska", "Львівська"], "UA-48": ["Mykolaivska", "Миколаївська"],
  "UA-51": ["Odeska", "Одеська"], "UA-53": ["Poltavska", "Полтавська"],
  "UA-56": ["Rivnenska", "Рівненська"], "UA-59": ["Sumska", "Сумська"],
  "UA-61": ["Ternopilska", "Тернопільська"], "UA-63": ["Kharkivska", "Харківська"],
  "UA-65": ["Khersonska", "Херсонська"], "UA-68": ["Khmelnytska", "Хмельницька"],
  "UA-71": ["Cherkaska", "Черкаська"], "UA-74": ["Chernihivska", "Чернігівська"],
  "UA-77": ["Chernivetska", "Чернівецька"],
};

let proj = geoMercator().fitWidth(760, fc);
let path = geoPath(proj);
let b = path.bounds(fc);
const t = proj.translate();
proj.translate([t[0] - b[0][0], t[1] - b[0][1]]); // shift bbox to (0,0)
path = geoPath(proj);
b = path.bounds(fc);
const W = Math.ceil(b[1][0]);
const H = Math.ceil(b[1][1]);
const round = (d) => d.replace(/-?\d+\.\d+/g, (m) => Math.round(+m));

const regions = fc.features.map((f) => {
  const id = f.properties.id;
  const m = MAP[id] || [f.properties.name, f.properties.name];
  return { id, name: f.properties.name, ie: eng.indexOf(m[0]), iu: ua.indexOf(m[1]), d: round(path(f)) };
});

writeFileSync(join(ROOT, "src/data/ukraine_regions.json"), JSON.stringify({ w: W, h: H, regions }));
const bad = regions.filter((r) => r.ie < 0 || r.iu < 0).map((r) => r.id);
const kb = (readFileSync(join(ROOT, "src/data/ukraine_regions.json")).length / 1024).toFixed(0);
console.log(`wrote ${regions.length} oblasts -> src/data/ukraine_regions.json (${W}x${H}, ${kb} KB)`);
if (bad.length) console.log("unmatched:", bad.join(", "));
