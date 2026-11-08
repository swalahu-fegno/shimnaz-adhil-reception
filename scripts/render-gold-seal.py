"""A polished gold wax seal with a raised A&S, lit like real metal.
usage: render-gold-seal.py OUT.webp PINYON.ttf [GREATVIBES.ttf] [--plain]   (--plain: no letters, for buttons)"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
OUT, FONT = sys.argv[1], sys.argv[2]
N = 900; C = N / 2
rng = np.random.default_rng(3)
yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
dx, dy = xx - C, yy - C
r = np.hypot(dx, dy); a = np.arctan2(dy, dx)
# poured edge: smooth lobes
R = 330 + 9 * np.sin(a * 7 + 0.4) + 6 * np.sin(a * 3 + 1.7) + 4 * np.sin(a * 13 + 2)
blob = np.clip((R - r) / 3 + 0.5, 0, 1)
t = np.clip(r / R, 0, 1)
h = np.sqrt(np.clip(1 - t ** 2.6, 0, 1)) * 60 * blob          # domed body
h += ndimage.gaussian_filter(rng.standard_normal((N, N)).astype(np.float32), 9) * 2.5 * blob  # wax ripples
# pressed well with a raised rim
RW = 228
well = np.clip((RW - r) / 2, 0, 1)
h = h * (1 - well) + (h.min() + 40) * well
h += 14 * np.exp(-((r - RW - 6) / 9) ** 2)                     # rim
h += 5 * np.exp(-((r - RW + 26) / 2.5) ** 2)                    # fine inner ring
# beads around the inside of the rim
for k in range(36):
    ang = k / 36 * 2 * np.pi
    bx, by = C + np.cos(ang) * (RW - 14), C + np.sin(ang) * (RW - 14)
    h += 5 * np.exp(-(((xx - bx) ** 2 + (yy - by) ** 2) / 18))
# raised monogram
m = Image.new('L', (N, N), 0); d = ImageDraw.Draw(m)
f = ImageFont.truetype(FONT, 160)
# Pinyon's S reads like a P: draw the S in Great Vibes (optional 3rd arg)
fs = ImageFont.truetype(sys.argv[3], 142) if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else f
parts = [('A', f, 0), ('&', f, -18), ('S', fs, -8)]
bbs = [d.textbbox((0, 0), t, font=ff) for t, ff, _ in parts]
x = C - sum(b[2] - b[0] + g for b, (_, _, g) in zip(bbs, parts)) / 2
for b, (t, ff, g) in zip(bbs, parts):
    x += g
    d.text((x - b[0], C - (b[1] + b[3]) / 2 - 6), t, font=ff, fill=255)
    x += b[2] - b[0]
mono = np.asarray(m).astype(np.float32) / 255
mono = ndimage.grey_dilation(mono, size=(5, 5))
mono_h = ndimage.gaussian_filter(mono, 2.2)
h += mono_h * 16 * well * (0 if '--plain' in sys.argv else 1)
h = ndimage.gaussian_filter(h, 1.1)

# normals
gy, gx = np.gradient(h)
n = np.dstack([-gx, -gy, np.ones_like(h)])
n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.5, -0.7, 0.9]); L /= np.linalg.norm(L)
dif = np.clip((n * L).sum(2), 0, 1)
Hh = L + [0, 0, 1]; Hh /= np.linalg.norm(Hh)
spec = np.clip((n * Hh).sum(2), 0, 1)
# fake studio environment: reflection vector's y picks bright/dark bands
ry = n[..., 1] * 2 * n[..., 2]; rx = n[..., 0] * 2 * n[..., 2]
env = 0.5 + 0.5 * np.cos(ry * 3.6 + 0.6) + 0.3 * np.cos(rx * 2.4 - 0.3)
gold_dark = np.array([0.36, 0.22, 0.06]); gold = np.array([0.83, 0.62, 0.26]); gold_hi = np.array([1.0, 0.93, 0.70])
k = np.clip(0.05 + 0.5 * dif + 0.55 * (env - 0.45), 0, 1)[..., None]
col = gold_dark * (1 - k) + gold * k
col = col + (gold_hi - col) * np.clip(spec ** 30 * 1.3 + spec ** 6 * 0.25, 0, 1)[..., None]
# ambient occlusion in the letters' and rim's creases
ao = ndimage.gaussian_filter(h, 6) - h
col *= np.clip(1 - np.clip(ao, 0, 8)[..., None] * 0.035, 0.6, 1)
# soft shadow on the paper
sh = ndimage.gaussian_filter(ndimage.shift(blob, (16, 9), order=1), 14) * 0.6
alpha = np.maximum(blob, sh)
rgb = np.where(blob[..., None] > 0, col, 0.05)
out = np.dstack([np.clip(rgb, 0, 1), alpha])
Image.fromarray((out * 255).astype(np.uint8), 'RGBA').resize((600, 600), Image.LANCZOS).save(OUT, quality=92)
print('ok')
