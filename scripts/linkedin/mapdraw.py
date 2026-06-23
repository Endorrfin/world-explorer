#!/usr/bin/env python3
"""Shared helpers: parse worldmap.json paths and render the colored world map.
Used only to generate LinkedIn share assets (not part of the app build)."""
import json, re, os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORLDMAP = os.path.join(ROOT, "src", "data", "worldmap.json")
COUNTRIES = os.path.join(ROOT, "src", "data", "countries.json")

# Continent accents from src/lib/continents.ts
CONT_COLOR = {
    "Africa": "#d98a2b",
    "Asia": "#c0524e",
    "Europe": "#4f7cc4",
    "North America": "#4f9d69",
    "South America": "#b25aa6",
    "Oceania": "#2f9e9a",
}

_TOK = re.compile(r"[MLZ]|-?\d+(?:\.\d+)?")

def parse_path(d):
    """Return list of subpaths; each subpath is a list of (x,y) floats."""
    toks = _TOK.findall(d)
    subs, cur, i, mode = [], [], 0, None
    n = len(toks)
    while i < n:
        t = toks[i]
        if t in ("M", "L"):
            mode = t
            if t == "M":
                if cur:
                    subs.append(cur)
                cur = []
            x = float(toks[i + 1]); y = float(toks[i + 2]); cur.append((x, y)); i += 3
        elif t == "Z":
            if cur:
                subs.append(cur); cur = []
            mode = None; i += 1
        else:  # bare number pair -> continuation of last mode
            x = float(toks[i]); y = float(toks[i + 1]); cur.append((x, y)); i += 2
    if cur:
        subs.append(cur)
    return subs

def load_world():
    with open(WORLDMAP, encoding="utf-8") as f:
        wm = json.load(f)
    with open(COUNTRIES, encoding="utf-8") as f:
        cs = json.load(f)
    iso2cont = {c["iso2"]: c["continent"] for c in cs}
    return wm, iso2cont

def _hex(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))

def render_map(out_w, *, ss=3, land="#e8edf4", stroke="#ffffff",
               stroke_w=1.0, palette=None, fill_countries=True,
               highlight=None, highlight_color="#ffd23f"):
    """Render the world map to an RGBA image `out_w` wide (natural 980:500 aspect).
    palette: dict continent->hex (defaults to CONT_COLOR). highlight: iso2 to accent."""
    wm, iso2cont = load_world()
    W, H = wm["w"], wm["h"]                      # 980 x 500
    out_h = round(out_w * H / W)
    sw, sh = out_w * ss, out_h * ss
    sx, sy = sw / W, sh / H
    img = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    pal = {k: _hex(v) for k, v in (palette or CONT_COLOR).items()}
    land_rgb = _hex(land)
    stroke_rgb = _hex(stroke)
    hl_rgb = _hex(highlight_color)

    def draw_path(d, fill, line, lw):
        for sub in parse_path(d):
            if len(sub) < 2:
                continue
            pts = [(x * sx, y * sy) for (x, y) in sub]
            if fill is not None and len(pts) >= 3:
                dr.polygon(pts, fill=fill)
            if line is not None and lw > 0:
                dr.line(pts + [pts[0]], fill=line, width=max(1, int(lw * ss)), joint="curve")

    # base landmass (so countries without continent still show)
    for d in wm.get("land", []):
        draw_path(d, land_rgb, None, 0)

    if fill_countries:
        for iso, d in wm.get("c", {}).items():
            ds = d if isinstance(d, str) else d.get("d", "")
            if not ds:
                continue
            cont = iso2cont.get(iso)
            col = hl_rgb if (highlight and iso == highlight) else pal.get(cont, land_rgb)
            draw_path(ds, col, stroke_rgb, stroke_w)

    if ss != 1:
        img = img.resize((out_w, out_h), Image.LANCZOS)
    return img

if __name__ == "__main__":
    m = render_map(1200, ss=2)
    bg = Image.new("RGB", m.size, (255, 255, 255))
    bg.paste(m, (0, 0), m)
    p = os.path.join(os.path.dirname(__file__), "_map_preview.png")
    bg.save(p)
    print("wrote", p, m.size)
