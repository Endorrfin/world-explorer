#!/usr/bin/env python3
"""Render a ~7.5s square MP4 promo for World Explorer (1080x1080, H.264)."""
import os
import numpy as np
import imageio.v2 as imageio
from PIL import Image, ImageDraw, ImageFont
import mapdraw as M

HERE = os.path.dirname(os.path.abspath(__file__))
SZ = 1080
FPS = 30
FREG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FBLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def hx(c):
    c = c.lstrip("#"); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))

BG = hx("#0d1730"); BG2 = hx("#0a1326")
WHITE = (255, 255, 255); MUT = hx("#9fb2d6"); BLUE = hx("#3b82f6"); GOLD = hx("#ffd84d")
BRIGHT = {"Africa":"#f0a23b","Asia":"#e8675f","Europe":"#5b91e6",
          "North America":"#4fc07c","South America":"#cf6dc0","Oceania":"#33c4bf"}

_fc = {}
def font(sz, bold=False):
    k = (sz, bold)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(FBLD if bold else FREG, sz)
    return _fc[k]

def ease(t):
    t = max(0.0, min(1.0, t)); return t*t*(3-2*t)

def alpha(col, a):
    return (col[0], col[1], col[2], int(max(0, min(1, a))*255))

# ---- static background (vertical gradient, vectorized) ----
def make_bg():
    f = np.linspace(0, 1, SZ).reshape(SZ, 1)
    row = (np.array(BG)*(1-f) + np.array(BG2)*f).astype(np.uint8)  # (SZ,3)
    arr = np.repeat(row[:, None, :], SZ, axis=1)                    # (SZ,SZ,3)
    return Image.fromarray(arr, "RGB")

# ---- prerender map once (RGBA) ----
MAP_W = 900
_map = M.render_map(MAP_W, ss=2, land="#22304f", palette=BRIGHT,
                    stroke="#0d1730", stroke_w=1.1, highlight="UA", highlight_color="#ffd84d")
MAP_H = _map.height
MAP_X = (SZ - MAP_W)//2
MAP_Y = 214

BG_IMG = make_bg()

STATS = [("195", "countries", 195, False),
         ("10", "quiz games", 10, False),
         ("34", "world records", 34, False),
         ("29,582", "settlements", 29582, True)]

def draw_text(d, xy, t, f, col, a=1.0, anchor="la"):
    d.text(xy, t, font=f, fill=alpha(col, a), anchor=anchor)

def frame(i, n):
    t = i / FPS
    base = BG_IMG.copy()
    # map fade-in (0.6s..1.8s)
    ma = ease((t-0.6)/1.2)
    if ma > 0:
        m = _map.copy()
        ach = m.split()[3].point(lambda v: int(v*ma))
        m.putalpha(ach)
        base.paste(m, (MAP_X, MAP_Y), m)
    ov = Image.new("RGBA", (SZ, SZ), (0,0,0,0))
    d = ImageDraw.Draw(ov)
    # title + tagline (0..1s)
    ta = ease(t/0.9)
    draw_text(d, (SZ/2, 64), "World Explorer", font(78, True), WHITE, ta, "ma")
    draw_text(d, (SZ/2, 162), "Learn all 195 countries with your kids", font(31), MUT, ease((t-0.3)/0.8), "ma")
    # stats counting (1.9s..4.6s), sequential
    stat_num_y, stat_lab_y = 706, 780
    colw = (SZ-120)/4
    for k,(_, lab, target, comma) in enumerate(STATS):
        st = 1.9 + k*0.45
        p = ease((t-st)/0.9)
        if p <= 0: continue
        val = int(round(target*p))
        s = f"{val:,}" if comma else str(val)
        cx = 60 + colw*k + colw/2
        draw_text(d, (cx, stat_num_y), s, font(58, True), BLUE if k%2==0 else GOLD, min(1,p*1.4), "ma")
        draw_text(d, (cx, stat_lab_y), lab, font(25), MUT, min(1,p*1.4), "ma")
    # CTA (5.3s..) — kept above the bottom edge with margin
    ca = ease((t-5.3)/0.9)
    if ca > 0:
        draw_text(d, (SZ/2, 850), "Free · no ads · offline · open-source", font(26), MUT, ca, "ma")
        draw_text(d, (SZ/2, 894), "endorrfin.github.io/world-explorer", font(42, True), WHITE, ca, "ma")
        draw_text(d, (SZ/2, 958), "Crimea is shown as Ukraine · UN GA Res. 68/262", font(20), hx("#6f81a8"), ca, "ma")
    base = Image.alpha_composite(base.convert("RGBA"), ov).convert("RGB")
    return base

def main():
    n = int(FPS*7.6)
    path = os.path.join(HERE, "world-explorer-linkedin.mp4")
    w = imageio.get_writer(path, fps=FPS, codec="libx264", quality=8,
                           macro_block_size=1, ffmpeg_params=["-pix_fmt", "yuv420p"])
    for i in range(n):
        w.append_data(np.asarray(frame(i, n)))
    # hold last frame ~1s
    last = np.asarray(frame(n-1, n))
    for _ in range(FPS):
        w.append_data(last)
    w.close()
    print("wrote", path, "frames", n+FPS)

if __name__ == "__main__":
    main()
