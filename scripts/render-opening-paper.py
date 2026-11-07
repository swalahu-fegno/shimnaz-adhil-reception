"""Premium olive felt paper for the opening page, with a blind-pressed
double border and corner flourishes (light from the upper left)."""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
OUT = sys.argv[1]
W, H = 1179, 2556
rng = np.random.default_rng(7)
def noise(scale, octaves=4):
    acc = np.zeros((H, W), np.float32); amp = 1; tot = 0
    for o in range(octaves):
        s = max(1, int(scale / 2 ** o))
        n = rng.standard_normal((H // s + 2, W // s + 2)).astype(np.float32)
        n = np.array(Image.fromarray(n).resize((W, H), Image.BICUBIC))
        acc += n * amp; tot += amp; amp *= 0.5
    return acc / tot
base = np.array([0.38, 0.39, 0.23], np.float32)
mott = noise(260, 3) * 0.035
fib = ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), (0.6, 2.2)) * 0.05
grain = rng.standard_normal((H, W)).astype(np.float32) * 0.018
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
light = 0.10 * np.exp(-(((xx - W * 0.3) / (W * 0.9)) ** 2 + ((yy - H * 0.15) / (H * 0.6)) ** 2))
vig = -0.13 * np.clip(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2, 0, 1.6)
lum = 1 + mott + fib + grain + light + vig

# blind-pressed design: mask drawn at 2x, then lit
S = 2
m = Image.new('L', (W * S, H * S), 0); d = ImageDraw.Draw(m)
def rect(inset, w):
    d.rectangle((inset * S, inset * S, (W - inset) * S, (H - inset) * S), outline=255, width=w * S)
rect(60, 4); rect(78, 2)
def corner(cx, cy, sx, sy):
    for k in range(5):
        r = 40 + k * 22
        d.arc(((cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S), 0, 360, fill=0)
    pts = []
    for t in np.linspace(0, 1, 60):
        a = t * np.pi * 1.6
        rr = 120 * (1 - t) + 18
        pts.append(((cx + sx * (30 + np.cos(a) * rr * 0.6 + t * 150)) * S, (cy + sy * (30 + np.sin(a) * rr * 0.6)) * S))
    d.line(pts, fill=255, width=3 * S)
    pts2 = [((cx + sx * (30 + np.sin(a) * rr * 0.6)) * S, (cy + sy * (30 + np.cos(a) * rr * 0.6 + t * 150)) * S)
            for t in np.linspace(0, 1, 60) for a, rr in [(t * np.pi * 1.6, 120 * (1 - t) + 18)]]
    d.line(pts2, fill=255, width=3 * S)
    for k in range(3):
        rr = 7 - k * 2
        x, y = cx + sx * (52 + k * 28), cy + sy * (52 + k * 28)
        d.ellipse(((x - rr) * S, (y - rr) * S, (x + rr) * S, (y + rr) * S), fill=255)
for cx, cy, sx, sy in [(78, 78, 1, 1), (W - 78, 78, -1, 1), (78, H - 78, 1, -1), (W - 78, H - 78, -1, -1)]:
    corner(cx, cy, sx, sy)
# small diamond on each side mid-point
for x, y in [(W / 2, 69), (W / 2, H - 69), (69, H / 2), (W - 69, H / 2)]:
    r = 9; d.polygon([((x) * S, (y - r) * S), ((x + r) * S, y * S), (x * S, (y + r) * S), ((x - r) * S, y * S)], fill=255)
mask = np.array(m.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
mask = ndimage.gaussian_filter(mask, 0.8)
gy, gx = np.gradient(ndimage.gaussian_filter(mask, 1.4))
press = (gx + gy) * 2.2        # debossed: edge facing light is dark, far edge bright
rgb = np.clip(base[None, None, :] * lum[..., None], 0, 1)
# raised polished gold, lit like the seal
hgt = ndimage.gaussian_filter(mask, 1.6) * 6
gy2, gx2 = np.gradient(hgt)
nrm = np.dstack([-gx2, -gy2, np.ones_like(hgt)]); nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
Lv = np.array([-0.5, -0.7, 0.9]); Lv /= np.linalg.norm(Lv)
dif = np.clip((nrm * Lv).sum(2), 0, 1)
Hv = Lv + [0, 0, 1]; Hv /= np.linalg.norm(Hv)
spec = np.clip((nrm * Hv).sum(2), 0, 1)
env = 0.5 + 0.5 * np.cos(nrm[..., 1] * 7 + yy / H * 9 + 0.6)
kk = np.clip(0.1 + 0.5 * dif + 0.45 * (env - 0.4), 0, 1)[..., None]
g = np.array([0.36, 0.22, 0.06]) * (1 - kk) + np.array([0.86, 0.66, 0.29]) * kk
g = g + (np.array([1, 0.94, 0.72]) - g) * np.clip(spec ** 30 * 1.2, 0, 1)[..., None]
# a soft shadow under the gold, then the gold itself
shd = ndimage.gaussian_filter(ndimage.shift(mask, (2.5, 1.5), order=1), 1.8)
rgb = rgb * (1 - shd[..., None] * 0.45)
am = np.clip(mask * 1.4, 0, 1)[..., None]
rgb = rgb * (1 - am) + g * am
Image.fromarray((rgb * 255).astype(np.uint8)).save(OUT, quality=90)
print('ok')
