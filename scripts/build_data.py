#!/usr/bin/env python3
"""
build_data.py  —  World Map data pipeline
=========================================
Reads the source spreadsheet (data.xlsx), cleans & validates it, joins the
auxiliary sheets, FIXES the broken continent classification (the source mislabels
all Caribbean states as "Oceania"), merges hand-written "known for" facts, and
emits a single static `src/data/countries.json` consumed by the React app.

Run:  python3 scripts/build_data.py
Re-run any time the spreadsheet or facts.json changes.
"""
import json
import math
import os
import re
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "data.xlsx")
FACTS = os.path.join(ROOT, "src", "data", "facts.json")
FACTS_UK = os.path.join(ROOT, "src", "data", "facts_uk.json")  # CHANGED: Phase 3 UA facts
NEIGHBORS = os.path.join(ROOT, "src", "data", "neighbors.json")
NAMES_UK = os.path.join(ROOT, "src", "data", "names_uk.json")
CAPITALS_UK = os.path.join(ROOT, "src", "data", "capitals_uk.json")
SYMBOLS = os.path.join(ROOT, "src", "data", "symbols.json")       # CHANGED
SYMBOLS_UK = os.path.join(ROOT, "src", "data", "symbols_uk.json") # CHANGED
OUT = os.path.join(ROOT, "src", "data", "countries.json")

# ---------------------------------------------------------------- helpers
def norm(n):
    """Normalize a country name for fuzzy joining across sheets."""
    if n is None:
        return ""
    return (
        str(n).lower().strip()
        .replace(".", "").replace("&", "and").replace("'", "")
        .replace("-", " ").replace("(", "").replace(")", "")
        .replace("  ", " ").strip()
    )

def num(v):
    """Coerce a cell to a float, tolerating strings like '−0.23%' or '1,234'."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return None if (isinstance(v, float) and math.isnan(v)) else v
    s = str(v).strip().replace("−", "-").replace(",", "").replace("%", "")
    try:
        return float(s)
    except ValueError:
        return None

def to_int(v):
    f = num(v)
    return None if f is None else int(round(f))

# Continent is decided by SUBREGION (which is correct in the source),
# NOT by the `region` column (which is wrong for every Caribbean state).
def continent_for(subregion):
    s = (subregion or "").lower()
    if "africa" in s:
        return "Africa"
    if "europe" in s:
        return "Europe"
    if "asia" in s or s == "south-eastern asi":   # source truncates Brunei's subregion
        return "Asia"
    if s in ("south america", "southern america"):
        return "South America"
    if s in ("northern america", "central america", "caribbean"):
        return "North America"
    if s in ("melanesia", "micronesia", "polynesia", "australia and new zealand"):
        return "Oceania"
    return "Unknown"

# Clean, kid-friendly English display names (only the broken / awkward ones).
NAME_FIX = {
    "LCA": "Saint Lucia",
    "Russian Federation": "Russia",
    "State of Palestine": "Palestine",
    "Holy See": "Vatican City",
    "Congo": "Republic of the Congo",
    "Sao Tome & Principe": "Sao Tome and Principe",
    "St. Vincent & Grenadines": "Saint Vincent and the Grenadines",
    "Saint Kitts & Nevis": "Saint Kitts and Nevis",
    "Antigua and Barbuda": "Antigua and Barbuda",
}

# Fix capitals the source truncated or left incomplete (keyed by ISO-2).
CAPITAL_FIX = {
    "ZA": "Pretoria, Cape Town, Bloemfontein",
    "NR": "Yaren",  # Nauru has no official capital; Yaren is the de-facto seat
}

def clean_capital(iso2, raw):
    if iso2 in CAPITAL_FIX:
        return CAPITAL_FIX[iso2]
    if raw is None:
        return raw
    return re.sub(r"\s*\[[^\]]*\]", "", str(raw).strip())  # drop footnotes e.g. "Jakarta[9]"

# Aliases so a main-sheet country can find its row in an aux sheet.
ALIASES = {
    "russian federation": ["russia"],
    "czech republic": ["czech republic czechia", "czechia"],
    "lca": ["saint lucia", "st lucia"],
    "state of palestine": ["palestine"],
}

# ---------------------------------------------------------------- load
wb = openpyxl.load_workbook(XLSX, data_only=True)

def rows_of(sheet):
    return [r for r in wb[sheet].iter_rows(min_row=2, values_only=True) if r[0] is not None]

def index_by_name(sheet, name_col):
    idx = {}
    for r in rows_of(sheet):
        key = norm(r[name_col])
        if key:
            idx[key] = r
    return idx

def lookup(idx, main_name):
    key = norm(main_name)
    if key in idx:
        return idx[key]
    for alt in ALIASES.get(key, []):
        if alt in idx:
            return idx[alt]
    return None

births_idx = index_by_name("BirthsPerDay", 4)     # Country col=4, value col=5
gpi_idx    = index_by_name("GPI-162", 3)          # Country col=3, GPI col=4
popw_idx   = index_by_name("pupulationWorld", 1)  # fert=9, medianAge=10, urban=11
area_idx   = index_by_name("Area", 3)             # Tot.Area col=4, world share col=8

facts = {}
if os.path.exists(FACTS):
    with open(FACTS, encoding="utf-8") as f:
        facts = json.load(f)

facts_uk = {}  # CHANGED: Phase 3 — Ukrainian "Known for" facts, keyed by ISO-2
if os.path.exists(FACTS_UK):
    with open(FACTS_UK, encoding="utf-8") as f:
        facts_uk = json.load(f)

neighbors = {}
if os.path.exists(NEIGHBORS):
    with open(NEIGHBORS, encoding="utf-8") as f:
        neighbors = json.load(f)

names_uk = {}
if os.path.exists(NAMES_UK):
    with open(NAMES_UK, encoding="utf-8") as f:
        names_uk = json.load(f)

capitals_uk = {}
if os.path.exists(CAPITALS_UK):
    with open(CAPITALS_UK, encoding="utf-8") as f:
        capitals_uk = json.load(f)

symbols = {}    # CHANGED
if os.path.exists(SYMBOLS):
    with open(SYMBOLS, encoding="utf-8") as f:
        symbols = json.load(f)

symbols_uk = {}  # CHANGED
if os.path.exists(SYMBOLS_UK):
    with open(SYMBOLS_UK, encoding="utf-8") as f:
        symbols_uk = json.load(f)

# ---------------------------------------------------------------- build
countries = []
main = rows_of("Сountries")   # NB: sheet title uses a Cyrillic 'С'
for r in main:
    iso2 = r[4]
    raw_name = r[7]
    name = NAME_FIX.get(raw_name, raw_name)
    sub = r[2]
    cont = continent_for(sub)

    births_row = lookup(births_idx, raw_name)
    gpi_row    = lookup(gpi_idx, raw_name)
    popw_row   = lookup(popw_idx, raw_name)
    area_row   = lookup(area_idx, raw_name)

    countries.append({
        "iso2": iso2,
        "iso3": r[3],
        "name": name,
        "nameUk": names_uk.get(iso2, name),
        "flag": r[6],                              # emoji fallback
        "continent": cont,
        "subregion": sub,
        "capital": clean_capital(iso2, r[8]),
        "capitalUk": capitals_uk.get(iso2, clean_capital(iso2, r[8])),
        "callingCode": to_int(r[5]),
        # people
        "population": to_int(r[9]),
        "populationWorldShare": num(r[10]),        # fraction
        "density": num(r[12]),
        "fertilityRate": num(popw_row[9]) if popw_row else None,
        "medianAge": num(popw_row[10]) if popw_row else None,
        "urbanPop": num(popw_row[11]) if popw_row else None,   # fraction
        "birthsPerDay": to_int(births_row[5]) if births_row else None,
        # economy
        "gdpNominal": to_int(r[13]),               # USD, 2023
        "gdpPerCapita": to_int(r[14]),             # USD, 2023
        "gdpWorldShare": num(r[15]),               # fraction
        # land
        "landAreaKm2": to_int(r[11]),
        "totalAreaKm2": to_int(area_row[4]) if area_row else None,
        "areaWorldShare": num(area_row[8]) if area_row else None,   # fraction
        # extras
        "peaceIndex": num(gpi_row[4]) if gpi_row else None,        # GPI 2024 (lower = safer)
        # content
        "knownFor": facts.get(iso2, []),
        "factsUk": facts_uk.get(iso2, []),        # CHANGED: Phase 3 UA facts
        # national symbols                         # CHANGED
        "animal":   symbols.get(iso2, {}).get("animal"),    # CHANGED
        "plant":    symbols.get(iso2, {}).get("plant"),     # CHANGED
        "dish":     symbols.get(iso2, {}).get("dish"),      # CHANGED
        "animalUk": symbols_uk.get(iso2, {}).get("animal"), # CHANGED
        "plantUk":  symbols_uk.get(iso2, {}).get("plant"),  # CHANGED
        "dishUk":   symbols_uk.get(iso2, {}).get("dish"),   # CHANGED
        "neighbors": neighbors.get(iso2, []),
    })

countries.sort(key=lambda c: (c["continent"], c["name"]))

# ---------------------------------------------------------------- validate
assert len(countries) == 195, f"expected 195, got {len(countries)}"
unknown = [c["name"] for c in countries if c["continent"] == "Unknown"]
assert not unknown, f"countries with unknown continent: {unknown}"
for req in ("iso2", "name", "capital", "population", "continent"):
    missing = [c["name"] for c in countries if c.get(req) in (None, "")]
    assert not missing, f"missing {req}: {missing}"

by_cont = {}
for c in countries:
    by_cont[c["continent"]] = by_cont.get(c["continent"], 0) + 1
have_births = sum(1 for c in countries if c["birthsPerDay"] is not None)
have_gpi = sum(1 for c in countries if c["peaceIndex"] is not None)
have_facts = sum(1 for c in countries if c["knownFor"])
have_facts_uk = sum(1 for c in countries if c["factsUk"])  # CHANGED: Phase 3 coverage
have_symbols  = sum(1 for c in countries if c["animal"])   # CHANGED: symbols coverage

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(countries, f, ensure_ascii=False, indent=1)

print(f"wrote {len(countries)} countries -> {os.path.relpath(OUT, ROOT)}")
print("by continent:", dict(sorted(by_cont.items())))
print(f"coverage: births/day={have_births}/195  peaceIndex={have_gpi}/195  knownFor={have_facts}/195  factsUk={have_facts_uk}/195  symbols={have_symbols}/195")  # CHANGED
