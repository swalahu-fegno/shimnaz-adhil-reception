"""Raised polished-gold lettering, lit like the gold seal.
usage: render-gold-text.py OUT.webp FONT.ttf TEXT SIZE
   or: render-gold-text.py OUT.webp --mask MASK.png BEVEL
       (MASK: white text on transparent, e.g. drawn by the browser for Arabic)"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
OUT = sys.argv[1]
if sys.argv[2] == '--mask':
    mask = np.asarray(Image.open(sys.argv[3]).convert('RGBA'))[..., 3].astype(np.float32) / 255
    BEV = float(sys.argv[4]); LIFT = 0.32
    THICK = int(sys.argv[5]) if len(sys.argv) > 5 else 0
    if THICK:
        mask = ndimage.grey_dilation(mask, size=(THICK, THICK))
    H, W = mask.shape
else:
    FONT, TXT, SIZE = sys.argv[2], sys.argv[3], int(sys.argv[4])
    f = ImageFont.truetype(FONT, SIZE)
    tmp = ImageDraw.Draw(Image.new('L', (1, 1)))
    bb = tmp.textbbox((0, 0), TXT, font=f)
    pad = SIZE // 4
    W, H = bb[2] - bb[0] + pad * 2, bb[3] - bb[1] + pad * 2
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).text((pad - bb[0], pad - bb[1]), TXT, font=f, fill=255)
    mask = np.asarray(m).astype(np.float32) / 255
    mask = ndimage.grey_dilation(mask, size=(3, 3))
    BEV = 6; LIFT = 0.0
# rounded bevel: distance inside the stroke
dist = ndimage.distance_transform_edt(mask > 0.5)
h = np.sqrt(np.clip(dist / BEV, 0, 1)) * 10
h = ndimage.gaussian_filter(h, 1.0)
gy, gx = np.gradient(h)
n = np.dstack([-gx, -gy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.5, -0.7, 0.9]); L /= np.linalg.norm(L)
dif = np.clip((n * L).sum(2), 0, 1)
Hh = L + [0, 0, 1]; Hh /= np.linalg.norm(Hh)
spec = np.clip((n * Hh).sum(2), 0, 1)
yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
env = 0.5 + 0.5 * np.cos(n[..., 1] * 3.6 + yy / H * 5 + 0.6)
k = np.clip(0.05 + LIFT + 0.5 * dif + 0.55 * (env - 0.45), 0, 1)[..., None]
col = np.array([0.36, 0.22, 0.06]) * (1 - k) + np.array([0.86, 0.65, 0.28]) * k
col = col + (np.array([1, 0.94, 0.72]) - col) * np.clip(spec ** 30 * 1.3 + spec ** 6 * 0.2, 0, 1)[..., None]
a = np.clip(ndimage.gaussian_filter(mask, 0.6), 0, 1)
sh = ndimage.gaussian_filter(ndimage.shift(mask, (BEV * 0.6, BEV * 0.3), order=1), BEV * 0.5) * 0.45
alpha = np.maximum(a, sh)
rgb = np.where(a[..., None] > 0.02, col, np.array([0.25, 0.17, 0.05]))
Image.fromarray((np.dstack([np.clip(rgb, 0, 1), alpha]) * 255).astype(np.uint8), 'RGBA').save(OUT, quality=92)
print(W, H)
