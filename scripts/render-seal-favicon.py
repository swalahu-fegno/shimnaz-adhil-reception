"""Render the ivory wax seal (A & S) as the favicon.

usage: python3 -I scripts/render-seal-favicon.py <public-dir>
Draws "A&" in Pinyon Script and "S" in Great Vibes (Pinyon's S reads like a P).
Writes favicon.png (64), apple-touch-icon.png (180) and favicon-512.png.
"""
import io, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from scipy import ndimage

PUB = sys.argv[1]
def ttf(name):
    f = TTFont(f'{PUB}/fonts/{name}'); f.flavor = None
    b = io.BytesIO(); f.save(b); b.seek(0); return b

S = 512
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
ex, ey = (xx - S / 2) / (S * 0.40), (yy - S / 2) / (S * 0.47)
er = np.sqrt(ex ** 2 + ey ** 2)
ang = np.arctan2(ey, ex)
blob = (er < 1 + 0.035 * np.sin(6 * ang + 0.4) + 0.025 * np.sin(11 * ang + 1.3)).astype(np.float32)
h = np.clip(ndimage.distance_transform_edt(blob) / 40, 0, 1) ** 0.55
h -= 0.3 * (er < 0.78)
h += 0.22 * np.exp(-((er - 0.79) ** 2) / (2 * 0.018 ** 2))
h = ndimage.gaussian_filter(h, 2)

m = Image.new('L', (S, S), 0)
d = ImageDraw.Draw(m)
fa = ImageFont.truetype(ttf('pinyon-script-normal-400.woff2'), 118)
fs = ImageFont.truetype(ttf('great-vibes-monogram.woff2'), 104)
parts = [('A', fa, 0), ('&', fa, -14), ('S', fs, -6)]
ws = [d.textbbox((0, 0), t, font=f) for t, f, _ in parts]
total = sum(b[2] - b[0] + g for b, (_, _, g) in zip(ws, parts))
x, cy = S / 2 - total / 2, S * 0.46
for b, (t, f, g) in zip(ws, parts):
    x += g
    d.text((x - b[0], cy - (b[1] + b[3]) / 2), t, font=f, fill=255)
    x += b[2] - b[0]
h += 0.4 * ndimage.gaussian_filter(np.asarray(m, np.float32) / 255, 1.6)

gy, gx = np.gradient(h * 40)
n = np.dstack([-gx, -gy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.55, -0.75, 1.0]); L /= np.linalg.norm(L)
dif = np.clip((n * L).sum(2), 0, 1)
hv = L + [0, 0, 1]; hv /= np.linalg.norm(hv)
spec = np.clip((n * hv).sum(2), 0, 1) ** 26
col = np.clip(np.array([0.93, 0.90, 0.83]) * (0.5 + 0.55 * dif[..., None]) + spec[..., None] * 0.5, 0, 1)
img = Image.fromarray((np.dstack([col, ndimage.gaussian_filter(blob, 0.9)]) * 255).astype(np.uint8), 'RGBA')
img.save(f'{PUB}/favicon-512.png')
img.resize((180, 180), Image.LANCZOS).save(f'{PUB}/apple-touch-icon.png')
img.resize((64, 64), Image.LANCZOS).save(f'{PUB}/favicon.png')
