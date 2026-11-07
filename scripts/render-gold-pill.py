"""A pill-shaped gold button lit exactly like the gold seal / music button.
usage: render-gold-pill.py OUT.webp"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
OUT = sys.argv[1]
W, H = 1200, 240; R = H / 2 - 14
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx = np.clip(xx, R + 14, W - R - 14); cy = H / 2
d = np.hypot(xx - cx, yy - cy)                      # distance from the pill's spine
rng = np.random.default_rng(4)
# poured-wax edge: soft lobes all the way round, like the seal
# arc length round the pill, so the lobes run on without a seam
xL, xR = R + 14, W - R - 14; Ls = xR - xL
ang = np.arctan2(yy - cy, xx - cx)
top = (xx >= xL) & (xx <= xR) & (yy < cy)
bot = (xx >= xL) & (xx <= xR) & (yy >= cy)
right = xx > xR
sArc = np.where(top, xx - xL,
       np.where(right, Ls + (ang + np.pi / 2) * R,
       np.where(bot, Ls + np.pi * R + (xR - xx),
                2 * Ls + np.pi * R + ((ang - np.pi / 2) % (2 * np.pi)) * R)))
P = 2 * Ls + 2 * np.pi * R
nl = 11                                   # whole number of lobes round the pill
phi = sArc / P * 2 * np.pi * nl
Re = R - 5 + 3.2 * np.sin(phi) + 1.6 * np.sin(phi * 2 + 1.3)
blob = np.clip((Re - d) / 2 + 0.5, 0, 1)
t = np.clip(d / Re, 0, 1)
h = np.sqrt(np.clip(1 - t ** 2.6, 0, 1)) * 40 * blob
h += ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 7) * 1.5 * blob
RW = R - 22                                          # pressed centre
well = np.clip((RW - d) / 2, 0, 1)
h = h * (1 - well) + (h.min() + 26) * well
h += 8 * np.exp(-((d - RW - 4) / 6) ** 2)            # raised rim
h += 3 * np.exp(-((d - RW + 18) / 2) ** 2)           # fine inner line
# a ring of tiny beads just inside the rim, as on the seal
BR = RW - 9
pts = [(x, cy - BR) for x in np.arange(R + 14, W - R - 14, 26)] + [(x, cy + BR) for x in np.arange(R + 14, W - R - 14, 26)]
for side, x0 in ((-1, R + 14), (1, W - R - 14)):
    for a in np.linspace(-np.pi / 2, np.pi / 2, 9)[1:-1]:
        pts.append((x0 + side * BR * np.cos(a), cy + BR * np.sin(a)))
for bx, by in pts:
    h += 4 * np.exp(-(((xx - bx) ** 2 + (yy - by) ** 2) / 14))
h = ndimage.gaussian_filter(h, 1.0)
gy, gx = np.gradient(h)
n = np.dstack([-gx, -gy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.5, -0.7, 0.9]); L /= np.linalg.norm(L)
dif = np.clip((n * L).sum(2), 0, 1)
Hh = L + [0, 0, 1]; Hh /= np.linalg.norm(Hh)
spec = np.clip((n * Hh).sum(2), 0, 1)
ry = n[..., 1] * 2 * n[..., 2]; rx = n[..., 0] * 2 * n[..., 2]
env = 0.5 + 0.5 * np.cos(ry * 3.6 + 0.6) + 0.3 * np.cos(rx * 2.4 - 0.3)
k = np.clip(0.05 + 0.5 * dif + 0.55 * (env - 0.45), 0, 1)[..., None]
col = np.array([0.36, 0.22, 0.06]) * (1 - k) + np.array([0.83, 0.62, 0.26]) * k
col = col + (np.array([1.0, 0.93, 0.70]) - col) * np.clip(spec ** 30 * 1.3 + spec ** 6 * 0.25, 0, 1)[..., None]
ao = ndimage.gaussian_filter(h, 5) - h
col *= np.clip(1 - np.clip(ao, 0, 8)[..., None] * 0.035, 0.6, 1)
out = np.dstack([np.clip(col, 0, 1), blob])
Image.fromarray((out * 255).astype(np.uint8), 'RGBA').resize((600, 120), Image.LANCZOS).save(OUT, quality=92)
print('ok')
