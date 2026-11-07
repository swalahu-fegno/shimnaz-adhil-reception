"""Illustrated venue map: olive pressed paper, raised gold roads and river,
the gold seal marking the venue. Not to scale — a keepsake, not navigation.
usage: render-gold-map.py OUT.webp FONTS_DIR SEAL.webp"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
OUT, FONTS, SEAL = sys.argv[1:4]
W, H, S = 1200, 820, 2
rng = np.random.default_rng(5)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# paper
base = np.array([0.37, 0.38, 0.22])
def noise(s, seed):
    r = np.random.default_rng(seed); n = r.standard_normal((H // s + 2, W // s + 2)).astype(np.float32)
    return np.array(Image.fromarray(n).resize((W, H), Image.BICUBIC))
lum = 1 + noise(140, 1) * 0.03 + ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), (0.6, 2)) * 0.04
lum += 0.09 * np.exp(-(((xx - W * 0.3) / W) ** 2 + ((yy - H * 0.2) / H) ** 2) * 2) - 0.12 * np.clip(((xx - W / 2) / (W * 0.6)) ** 2 + ((yy - H / 2) / (H * 0.6)) ** 2, 0, 1.5)
rgb = np.clip(base * lum[..., None], 0, 1)
# gold mask: roads, river, border, compass
m = Image.new('L', (W * S, H * S), 0); d = ImageDraw.Draw(m)
def path(pts, w):
    d.line([(x * S, y * S) for x, y in pts], fill=255, width=int(w * S), joint='curve')
def curve(p0, p1, p2, n=80):
    t = np.linspace(0, 1, n)[:, None]
    return [tuple(v) for v in ((1 - t) ** 2 * np.array(p0) + 2 * (1 - t) * t * np.array(p1) + t ** 2 * np.array(p2))]
VX, VY = 690, 420                                  # the venue
path(curve((-20, 300), (420, 380), (VX, VY)), 7)           # road from Palakkad
path(curve((VX, VY), (930, 470), (1230, 430)), 7)          # on to Shoranur
path(curve((VX, VY), (640, 650), (560, 860)), 5)           # south road
path(curve((300, -20), (360, 200), (470, 330)), 4)         # town street
# river (Bharathapuzha): two thin banks
for off in (-7, 7):
    path([(x, 700 + 40 * np.sin(x / 170) + off) for x in np.linspace(-20, 1220, 140)], 2.5)
# keep roads and river inside the frame
clip = Image.new('L', (W * S, H * S), 0); ImageDraw.Draw(clip).rectangle((50 * S, 50 * S, (W - 50) * S, (H - 50) * S), fill=255)
m = Image.composite(m, Image.new('L', m.size, 0), clip); d = ImageDraw.Draw(m)
# double border
d.rectangle((28 * S, 28 * S, (W - 28) * S, (H - 28) * S), outline=255, width=4 * S)
d.rectangle((42 * S, 42 * S, (W - 42) * S, (H - 42) * S), outline=255, width=2 * S)
# compass
cx, cy = 1080, 150
d.polygon([(cx * S, (cy - 52) * S), ((cx + 11) * S, cy * S), (cx * S, (cy + 52) * S), ((cx - 11) * S, cy * S)], fill=255)
d.polygon([((cx - 40) * S, cy * S), (cx * S, (cy - 7) * S), ((cx + 40) * S, cy * S), (cx * S, (cy + 7) * S)], fill=255)
d.ellipse(((cx - 30) * S, (cy - 30) * S, (cx + 30) * S, (cy + 30) * S), outline=255, width=2 * S)
# labels
def text(t, x, y, size, font='CormorantItalic.ttf', anchor='mm'):
    f = ImageFont.truetype(f'{FONTS}/{font}', size * S)
    d.text((x * S, y * S), t, font=f, fill=255, anchor=anchor)
text('N', cx, cy - 75, 30, 'CormorantItalic.ttf')
text('Pattambi', 330, 150, 64, 'Pinyon.ttf')
text('to Palakkad', 150, 285, 30)
text('to Shoranur', 1060, 395, 30)
text('Bharathapuzha', 950, 640, 32)
text('Royal Convention Centre', VX + 20, VY - 120, 46, 'Pinyon.ttf')
mask = np.asarray(m.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
# raised gold, same lighting as the seal
hgt = ndimage.gaussian_filter(mask, 1.4) * 6
gy, gx = np.gradient(hgt)
n = np.dstack([-gx, -gy, np.ones_like(hgt)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.5, -0.7, 0.9]); L /= np.linalg.norm(L)
dif = np.clip((n * L).sum(2), 0, 1)
Hh = L + [0, 0, 1]; Hh /= np.linalg.norm(Hh)
spec = np.clip((n * Hh).sum(2), 0, 1)
env = 0.5 + 0.5 * np.cos(n[..., 1] * 7 + yy / H * 9 + 0.6)
k = np.clip(0.15 + 0.5 * dif + 0.45 * (env - 0.4), 0, 1)[..., None]
g = np.array([0.40, 0.25, 0.07]) * (1 - k) + np.array([0.88, 0.68, 0.30]) * k
g = g + (np.array([1, 0.94, 0.72]) - g) * np.clip(spec ** 30 * 1.2, 0, 1)[..., None]
sh = ndimage.gaussian_filter(ndimage.shift(mask, (2.5, 1.5), order=1), 1.8)
rgb = rgb * (1 - sh[..., None] * 0.45)
a = np.clip(mask * 1.3, 0, 1)[..., None]
rgb = rgb * (1 - a) + g * a
img = Image.fromarray((rgb * 255).astype(np.uint8)).convert('RGBA')
# the gold seal on the venue, with a soft halo
halo = Image.new('L', (W, H), 0); ImageDraw.Draw(halo).ellipse((VX - 95, VY - 95, VX + 95, VY + 95), fill=110)
halo = halo.filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(30))
img = Image.composite(Image.new('RGBA', (W, H), (255, 236, 170, 255)), img, halo)
seal = Image.open(SEAL).convert('RGBA').resize((150, 150), Image.LANCZOS)
img.alpha_composite(seal, (VX - 75, VY - 75))
img.convert('RGB').save(OUT, quality=88)
print('ok')
