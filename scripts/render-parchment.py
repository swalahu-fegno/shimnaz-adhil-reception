"""Parchment scroll for the invitation card: aged sheet with rolled ends.
usage: render-parchment.py OUT.webp
Also writes OUT-sheet.webp (no rolls) and OUT-roll.webp (one roll), for unrolling."""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
OUT = sys.argv[1]
W, H = 860, 1600
ROLL = 92            # roll diameter
SX = 34              # sheet inset from the rolls' ends
rng = np.random.default_rng(11)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def noise(s, o=4, seed=0):
    r = np.random.default_rng(seed); acc = np.zeros((H, W), np.float32); a = 1; t = 0
    for k in range(o):
        n = r.standard_normal((H // max(1, s >> k) + 2, W // max(1, s >> k) + 2)).astype(np.float32)
        acc += np.array(Image.fromarray(n).resize((W, H), Image.BICUBIC)) * a; t += a; a *= 0.5
    return acc / t
# sheet between the rolls, with a slightly wavy, torn side edge
top, bot = ROLL * 0.55, H - ROLL * 0.55
edge = noise(40, 3, 1) * 5
sheet = ((xx > SX + edge) & (xx < W - SX - edge) & (yy > top) & (yy < bot)).astype(np.float32)
sheet = ndimage.gaussian_filter(sheet, 0.8)
base = np.array([0.93, 0.86, 0.70], np.float32)
blot = noise(220, 4, 2) * 0.06 + noise(60, 3, 3) * 0.03
fib = ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), (0.5, 2.5)) * 0.03
grain = rng.standard_normal((H, W)).astype(np.float32) * 0.012
# darker, burnt-looking edges
d = ndimage.distance_transform_edt(sheet > 0.5)
burn = np.exp(-d / 26) * 0.32 + np.exp(-d / 90) * 0.12
lum = 1 + blot + fib + grain - burn
col = base[None, None] * lum[..., None]
col = col * (1 - burn[..., None] * np.array([0.2, 0.35, 0.6]))   # browner toward the edge
# soft curl shading just inside each roll
for y0, s in [(top, 1), (bot, -1)]:
    t = np.clip((yy - y0) * s / 70, 0, 1)
    col *= (0.82 + 0.18 * t)[..., None]
alpha = sheet
# the two rolls: cylinders, lit from the upper left
def roll(cy):
    global col, alpha
    r = ROLL / 2
    m = (np.abs(yy - cy) < r) & (xx > 6) & (xx < W - 6)
    v = np.clip((yy - cy) / r, -1, 1)
    nz = np.sqrt(np.clip(1 - v ** 2, 0, 1))
    shade = np.clip(0.35 + 0.75 * (nz * 0.85 - v * 0.45), 0, 1.15)
    spiral = 0.92 + 0.08 * np.sin((xx / W) * 2 * np.pi * 0 + v * 9)
    rc = np.array([0.90, 0.82, 0.64])[None, None] * (shade * spiral)[..., None]
    rc *= (1 + noise(30, 2, 5)[..., None] * 0.05)
    # darker rolled-paper ends (spiral seen end-on)
    for ex in (6, W - 6):
        e = np.exp(-((xx - ex) / 10) ** 2)
        rc = rc * (1 - (e * 0.35)[..., None])
    mm = ndimage.gaussian_filter(m.astype(np.float32), 0.8)
    col = col * (1 - mm[..., None]) + rc * mm[..., None]
    alpha = np.maximum(alpha, mm)
    # shadow the roll casts on the sheet
    sh = np.exp(-np.clip((yy - cy - r) / 14, 0, None)) * (yy > cy + r) * 0.25 if cy < H / 2 else 0
    if cy < H / 2:
        col *= (1 - (sh * sheet)[..., None])
Image.fromarray((np.dstack([np.clip(col, 0, 1), np.clip(alpha, 0, 1)]) * 255).astype(np.uint8), 'RGBA').save(OUT.replace('.webp', '-sheet.webp'), quality=88)
_c, _a = col.copy(), np.zeros_like(alpha)
col, alpha = _c, _a
roll(ROLL / 2 + 4)
rl = np.dstack([np.clip(col, 0, 1), np.clip(alpha, 0, 1)])[: ROLL + 8]
Image.fromarray((rl * 255).astype(np.uint8), 'RGBA').save(OUT.replace('.webp', '-roll.webp'), quality=88)
col, alpha = _c, _a
alpha = sheet.copy()
roll(ROLL / 2 + 4); roll(H - ROLL / 2 - 4)
out = np.dstack([np.clip(col, 0, 1), np.clip(alpha, 0, 1)])
Image.fromarray((out * 255).astype(np.uint8), 'RGBA').save(OUT, quality=88)
print('ok')
