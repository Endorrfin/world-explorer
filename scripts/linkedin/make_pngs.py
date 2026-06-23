#!/usr/bin/env python3
"""Generate two LinkedIn share PNGs (1200x1200): a clean stat-card and a map-hero."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import mapdraw as M

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = HERE
S = 2  # supersample factor for crisp edges/text

FREG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FBLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def hx(c):
    c = c.lstrip("#"); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))

# palette
INK   = hx("#16233f")
SUB   = hx("#5b6b86")
BLUE  = hx("#2f6fed")
BLUED = hx("#1f54c4")
PANEL = hx("#eef3fb")
LINE  = hx("#dde5f1")
WHITE = (255, 255, 255)

CONTENT = dict(
    brand="World Explorer",
    tag="An interactive world atlas for curious kids — free, no ads, works offline",
    stats=[("195", "countries"), ("10", "quiz games"),
           ("34", "world records"), ("29K+", "UA settlements")],
    features=[
        ("Clickable world map",  "Pan, zoom — all 195 countries"),
        ("10 quiz games",        "Flags, capitals, outlines, “Where in the world?”"),
        ("34 world records",     "From the smallest country to the oldest republic"),
        ("National symbols",     "Animal · plant · dish for every country"),
        ("Ukraine in depth",     "Oblast map + 29,582 settlements"),
        ("Fully bilingual",      "Every screen in English & Українська"),
    ],
    chips=["React 18", "TypeScript", "Vite", "GitHub Pages", "open source"],
    url="endorrfin.github.io/world-explorer",
    note="Crimea is shown as Ukraine · UN GA Res. 68/262",
    cta="Try it now →",
)

_fcache = {}
def font(size, bold=False):
    key = (size, bold)
    if key not in _fcache:
        _fcache[key] = ImageFont.truetype(FBLD if bold else FREG, int(size * S))
    return _fcache[key]

def px(v): return int(v * S)

def tw(dr, t, f): return dr.textlength(t, font=f)

def fit(dr, t, max_w, base, bold=False, minsz=14):
    sz = base
    while sz > minsz and tw(dr, t, font(sz, bold)) > max_w * S:
        sz -= 1
    return font(sz, bold)

def text(dr, xy, t, f, fill, anchor="la"):
    dr.text((px(xy[0]), px(xy[1])), t, font=f, fill=fill, anchor=anchor)

def globe(dr, cx, cy, r, col=BLUE, line=WHITE):
    cx, cy, r = px(cx), px(cy), px(r)
    dr.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col)
    lw = max(1, int(2.2 * S))
    dr.ellipse([cx-r, cy-r, cx+r, cy+r], outline=line, width=lw)
    dr.ellipse([cx-int(r*0.42), cy-r, cx+int(r*0.42), cy+r], outline=line, width=lw)  # meridian
    dr.line([cx-r, cy, cx+r, cy], fill=line, width=lw)                                 # equator
    dr.line([cx-int(r*0.92), cy-int(r*0.5), cx+int(r*0.92), cy-int(r*0.5)], fill=line, width=lw)
    dr.line([cx-int(r*0.92), cy+int(r*0.5), cx+int(r*0.92), cy+int(r*0.5)], fill=line, width=lw)

def rrect(dr, box, rad, **kw):
    dr.rounded_rectangle([px(box[0]), px(box[1]), px(box[2]), px(box[3])],
                         radius=px(rad), **kw)

# ----------------------------------------------------------------- Variant A
def card():
    W = H = 1200
    img = Image.new("RGB", (W*S, H*S), WHITE)
    dr = ImageDraw.Draw(img)
    c = CONTENT

    # faint world-map watermark across the whole card
    wm = M.render_map(W, ss=2, land="#eef2f8",
                      palette={k: "#e6edf7" for k in M.CONT_COLOR},
                      stroke="#dfe7f2", stroke_w=0.8)
    wm = wm.resize((W*S, int(W*S*wm.height/wm.width)), Image.LANCZOS)
    faint = Image.new("RGBA", (W*S, H*S), (0, 0, 0, 0))
    faint.paste(wm, (0, px(560)), wm)
    a = faint.split()[3].point(lambda v: int(v * 0.22))
    faint.putalpha(a)
    img.paste(faint, (0, 0), faint)

    M_ = 64  # margin
    # header
    globe(dr, M_+34, 96, 38)
    text(dr, (M_+92, 60), c["brand"], font(62, True), INK)
    f_tag = fit(dr, c["tag"], W-2*M_-96, 25)
    text(dr, (M_+94, 138), c["tag"], f_tag, SUB)
    dr.line([px(M_), px(196), px(W-M_), px(196)], fill=LINE, width=max(1, int(1.5*S)))

    # stat row
    sy0, sy1 = 214, 372
    colw = (W - 2*M_) / 4
    for i, (num, lab) in enumerate(c["stats"]):
        cx = M_ + colw*i + colw/2
        text(dr, (cx, sy0+8), num, font(76, True), BLUE, anchor="ma")
        text(dr, (cx, sy0+108), lab, font(26), SUB, anchor="ma")
        if i:
            x = px(M_ + colw*i)
            dr.line([x, px(sy0+24), x, px(sy1-26)], fill=LINE, width=max(1, int(1.4*S)))
    dr.line([px(M_), px(sy1), px(W-M_), px(sy1)], fill=LINE, width=max(1, int(1.5*S)))

    # features (2 cols x 3 rows)
    fx = [M_, W/2 + 8]
    colW = (W/2) - M_ - 8
    fy0, rowh = 410, 168
    for i, (ti, sub) in enumerate(c["features"]):
        col, row = i % 2, i // 2
        x = fx[col]; y = fy0 + row*rowh
        rrect(dr, (x, y+6, x+8, y+62), 4, fill=BLUE)
        text(dr, (x+26, y), ti, font(35, True), INK)
        f_sub = fit(dr, sub, colW-30, 25)
        text(dr, (x+26, y+52), sub, f_sub, SUB)

    # footer
    fy = 968
    dr.rectangle([0, px(fy-14), px(W), px(H)], fill=PANEL)
    # chips
    cxp = M_; chy = fy+10
    for ch in c["chips"]:
        w = tw(dr, ch, font(24)) / S + 34
        rrect(dr, (cxp, chy, cxp+w, chy+44), 22, fill=WHITE, outline=LINE, width=max(1,int(1.2*S)))
        text(dr, (cxp+17, chy+9), ch, font(24), SUB)
        cxp += w + 12
    # url + cta
    text(dr, (M_, fy+74), c["url"], font(30, True), BLUED)
    text(dr, (W-M_, fy+74), c["cta"], font(30, True), BLUE, anchor="ra")
    text(dr, (M_, fy+120), c["note"], font(22), SUB)

    img = img.resize((W, H), Image.LANCZOS)
    p = os.path.join(OUT, "world-explorer-linkedin-card.png")
    img.save(p); print("wrote", p)

# ----------------------------------------------------------------- Variant B
BG = hx("#0d1730"); BG2 = hx("#0a1326")
BRIGHT = {"Africa":"#f0a23b","Asia":"#e8675f","Europe":"#5b91e6",
          "North America":"#4fc07c","South America":"#cf6dc0","Oceania":"#33c4bf"}

def hero():
    W = H = 1200
    img = Image.new("RGB", (W*S, H*S), BG)
    dr = ImageDraw.Draw(img)
    c = CONTENT
    # subtle vertical gradient
    top = Image.new("L", (1, H*S))
    for y in range(H*S):
        top.putpixel((0, y), int(18 * (y/(H*S))))
    grad = Image.new("RGB", (W*S, H*S), BG2)
    img = Image.composite(grad, img, top.resize((W*S, H*S)))
    dr = ImageDraw.Draw(img)

    # headline
    text(dr, (W/2, 70), c["brand"], font(86, True), WHITE, anchor="ma")
    text(dr, (W/2, 182), "Learn all 195 countries with your kids",
         font(34), hx("#9fb2d6"), anchor="ma")

    # stat pills row
    pills = ["195 countries", "10 quiz games", "34 world records", "EN / Українська"]
    gap = 16
    widths = [tw(dr, p, font(27, True))/S + 50 for p in pills]
    totalw = sum(widths) + gap*(len(pills)-1)
    x = (W - totalw)/2; y = 250
    for p, w in zip(pills, widths):
        rrect(dr, (x, y, x+w, y+58), 29, fill=hx("#16224a"), outline=BLUE, width=max(1, int(1.8*S)))
        text(dr, (x+w/2, y+13), p, font(27, True), WHITE, anchor="ma")
        x += w + gap

    # world map (colored, bright), full width
    mp = M.render_map(W-40, ss=2, land="#22304f", palette=BRIGHT,
                      stroke="#0d1730", stroke_w=1.1, highlight="UA",
                      highlight_color="#ffd84d")
    mp = mp.resize(((W-40)*S, int((W-40)*S*mp.height/mp.width)), Image.LANCZOS)
    my = px(360)
    img.paste(mp, (px(20), my), mp)
    dr = ImageDraw.Draw(img)

    # bottom CTA band
    by = 980
    band = Image.new("RGBA", (W*S, px(H-by)), (8, 14, 28, 235))
    img.paste(band, (0, px(by)), band)
    dr = ImageDraw.Draw(img)
    dr.line([px(0), px(by), px(W), px(by)], fill=hx("#22305a"), width=max(1,int(1.5*S)))
    text(dr, (W/2, by+26), "Free · no ads · no sign-up · works offline · open-source",
         font(27), hx("#9fb2d6"), anchor="ma")
    text(dr, (W/2, by+74), c["url"], font(44, True), WHITE, anchor="ma")
    text(dr, (W/2, by+140), "Crimea is shown as Ukraine · UN GA Res. 68/262",
         font(21), hx("#6f81a8"), anchor="ma")

    img = img.resize((W, H), Image.LANCZOS)
    p = os.path.join(OUT, "world-explorer-linkedin-hero.png")
    img.save(p); print("wrote", p)

if __name__ == "__main__":
    card()
    hero()
