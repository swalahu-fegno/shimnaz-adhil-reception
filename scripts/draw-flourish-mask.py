"""Draw a symmetric scroll flourish as a white mask (for render-gold-text --mask).
usage: draw-flourish-mask.py OUT.png"""
import sys, numpy as np
from PIL import Image, ImageDraw
W, H, S = 1400, 260, 3
im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
cy = H / 2
def line(pts, w):
    d.line([(x * S, y * S) for x, y in pts], fill=(255, 255, 255, 255), width=int(w * S), joint='curve')
def spiral(cx, cy0, r0, turns, dirx, diry, w):
    pts = []
    for t in np.linspace(0, 1, 160):
        a = t * turns * 2 * np.pi
        r = r0 * (1 - t * 0.85)
        pts.append((cx + dirx * r * np.cos(a), cy0 + diry * r * np.sin(a)))
    line(pts, w)
def side(sgn):
    c = W / 2
    # long tapering stem from near the centre outwards, gently waving
    for k, (amp, wid) in enumerate([(14, 7), (14, 3)]):
        pts = [(c + sgn * (150 + x), cy + (amp if k == 0 else -amp) * np.sin(x / 95) * (1 - x / 520)) for x in np.linspace(0, 480, 200)]
        line(pts, wid)
    # big curl at the end
    spiral(c + sgn * 655, cy, 46, 1.6, sgn, 1, 6)
    # two leafy curls along the stem
    spiral(c + sgn * 330, cy - 34, 26, 1.3, -sgn, -1, 4.5)
    spiral(c + sgn * 470, cy + 30, 22, 1.3, -sgn, 1, 4)
    # beads
    for x, r in [(200, 7), (260, 5), (560, 6)]:
        d.ellipse(((c + sgn * x - r) * S, (cy - r) * S, (c + sgn * x + r) * S, (cy + r) * S), fill=(255, 255, 255, 255))
side(1); side(-1)
im.resize((W, H), Image.LANCZOS).save(sys.argv[1])
print('ok')
