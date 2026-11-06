"""Render the lace-and-pearl olive envelope as aligned image layers.

usage: python3 -I scripts/render-lace-envelope.py <out-dir> <olive-paper.webp> <fonts-dir>
  env-base.webp         RGBA    — side flaps, bottom flap (+ lace, vines, pearls); inside left clear
  env-flap.webp         RGBA    — top flap (+ lace, vines, pearls)
  env-flap-shadow.webp  RGBA    — the flap's shadow on the pocket
  env-seal.webp         RGBA    — gathered tulle + oval ivory wax seal
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage

OUT, TEX, FONTS = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 1080, 2340
CX, CY = W / 2, H * 0.5
TOP_TIP = H * 0.49
BOT_TIP = H * 0.51
rng = np.random.default_rng(11)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# ------------------------------------------------------------------ helpers
def tile(img, scale=1.6):
    t = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
    out = Image.new('RGB', (W, H))
    for x in range(0, W, t.width):
        for y in range(0, H, t.height):
            out.paste(t, (x, y))
    return np.asarray(out).astype(np.float32) / 255


paper = tile(Image.open(TEX).convert('RGB'), scale=2.1)
grain = (paper - paper.mean((0, 1))) * 0.62
# gentle mottling, like dyed handmade paper
mott = ndimage.gaussian_filter(rng.standard_normal((H // 4, W // 4)).astype(np.float32), 14)
mott = np.asarray(Image.fromarray(mott / (np.abs(mott).max() + 1e-6)).resize((W, H), Image.BICUBIC))
grain = grain + mott[..., None] * np.array([0.035, 0.035, 0.02])
# fine paper fibres
fib = Image.new('L', (W, H), 0)
fd = ImageDraw.Draw(fib)
for _ in range(2600):
    x, y = rng.uniform(0, W), rng.uniform(0, H)
    a_ = rng.uniform(0, np.pi)
    ln = rng.uniform(6, 22)
    pts = [(x + np.cos(a_ + k * 0.15) * k * ln / 4, y + np.sin(a_ + k * 0.15) * k * ln / 4) for k in range(5)]
    fd.line(pts, fill=int(rng.uniform(60, 140)), width=1)
fibres = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.4))).astype(np.float32) / 255
grain = grain + (fibres[..., None] - fibres.mean()) * 0.05
d = np.sqrt(((xx - W * 0.3) / W) ** 2 + ((yy - H * 0.2) / H) ** 2)
cglow = np.exp(-(((xx - W / 2) / (W * 0.55)) ** 2 + ((yy - H / 2) / (H * 0.32)) ** 2))
LIGHT = (1.1 - 0.36 * d + 0.08 * cglow)[..., None]
OLIVE = np.array([0.50, 0.50, 0.33], np.float32)
IVORY = np.array([0.95, 0.93, 0.86], np.float32)


def olive(tone=1.0):
    return np.clip((OLIVE * tone + grain * 1.1) * LIGHT, 0, 1)


def shade(h, k, light=(-0.55, -0.75, 1.0), spec=0.0, shin=24):
    gy, gx = np.gradient(h)
    n = np.dstack([-gx * k, -gy * k, np.ones_like(h)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    L = np.array(light, np.float32)
    L /= np.linalg.norm(L)
    dif = np.clip((n * L).sum(2), 0, 1) / L[2]
    s = np.zeros_like(h)
    if spec:
        Hh = L + np.array([0, 0, 1.0])
        Hh /= np.linalg.norm(Hh)
        s = spec * np.clip((n * Hh).sum(2), 0, 1) ** shin
    return dif, s


def canvas():
    return Image.new('L', (W, H), 0)


def arr(img):
    return np.asarray(img).astype(np.float32) / 255


def poly(pts, blur=1.0):
    m = canvas()
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return arr(m.filter(ImageFilter.GaussianBlur(blur))) if blur else arr(m)


def over(img, col, a):
    a = np.clip(a, 0, 1)[..., None]
    return img * (1 - a) + col * a


def cast(img, mask, dy=10, dx=4, blur=10, k=0.45):
    s = ndimage.gaussian_filter(ndimage.shift(mask, (dy, dx), order=1), blur)
    return img * (1 - k * s[..., None])


# --------------------------------------------------------- lace along an edge
SS = 2  # supersampling for fine threads
_net = None


def net():
    """A fine hexagonal tulle net covering the canvas (alpha)."""
    global _net
    if _net is None:
        y, x = np.mgrid[0:H * SS, 0:W * SS].astype(np.float32) / SS
        sp = 7.0
        m = np.zeros_like(x)
        for ang in (0, 60, 120):
            t = np.radians(ang)
            u = (x * np.cos(t) + y * np.sin(t)) / sp
            m = np.maximum(m, (np.abs(u - np.round(u)) < 0.11).astype(np.float32))
        _net = m
    return _net


def lace(p0, p1, side):
    """Delicate lace trim along p0→p1: net, corded scallops with picots, and
    alternating embroidered flowers and leaf sprays. Returns (alpha, height)."""
    p0, p1 = np.array(p0, float), np.array(p1, float)
    v = p1 - p0
    L = np.linalg.norm(v)
    u = v / L
    n = np.array([-u[1], u[0]]) * side
    S = SS
    P = lambda q: (float(q[0] * S), float(q[1] * S))
    region = Image.new('L', (W * S, H * S), 0)
    solid = Image.new('L', (W * S, H * S), 0)
    dr, ds = ImageDraw.Draw(region), ImageDraw.Draw(solid)
    inner = 60
    dr.polygon([P(p0 - n * 2), P(p1 - n * 2), P(p1 - n * inner), P(p0 - n * inner)], fill=255)
    step = 58
    for i in range(int(L // step) + 1):
        c = p0 + u * (i * step + step / 2)
        o = c + n * 2
        R = 27
        box = [P(o - np.array([R, R])), P(o + np.array([R, R]))]
        dr.ellipse([box[0], box[1]], fill=255)
        # the cord following each scallop's outer edge
        base_ang = np.degrees(np.arctan2(n[1], n[0]))
        ds.arc([box[0], box[1]], base_ang - 92, base_ang + 92, fill=255, width=int(2.6 * S))
        for k in range(-2, 3):  # picots
            a_ = np.radians(base_ang + k * 34)
            q = o + (R + 4) * np.array([np.cos(a_), np.sin(a_)])
            ds.ellipse([P(q - 2.4), P(q + 2.4)], fill=255)
        m = c - n * 24
        if i % 2 == 0:  # five-petal flower, densely stitched
            for k in range(5):
                a_ = k * 2 * np.pi / 5 + 0.3
                q = m + 8.5 * np.array([np.cos(a_), np.sin(a_)])
                ds.ellipse([P(q - 5.2), P(q + 5.2)], outline=255, width=int(1.6 * S))
                ds.ellipse([P(q - 2.2), P(q + 2.2)], fill=200)
            ds.ellipse([P(m - 3.6), P(m + 3.6)], fill=255)
        else:  # little leaf spray
            ds.line([P(m + n * 10), P(m - n * 10)], fill=255, width=int(1.4 * S))
            for t_, sgn in ((-6, 1), (0, -1), (6, 1)):
                b = m + n * t_ * 0.9
                tip = b + u * 11 * sgn + n * 4
                perp = np.array([-(tip - b)[1], (tip - b)[0]]) / np.linalg.norm(tip - b) * 3.4
                mid = (b + tip) / 2
                ds.polygon([P(b), P(mid + perp), P(tip), P(mid - perp)], fill=235)
    # straight cords along the heading, with a row of seed beads between
    ds.line([P(p0 - n * inner), P(p1 - n * inner)], fill=255, width=int(2.8 * S))
    ds.line([P(p0 - n * (inner - 7)), P(p1 - n * (inner - 7))], fill=210, width=int(1.2 * S))
    for i in range(int(L // 11) + 1):
        b = p0 + u * (i * 11 + 5) - n * (inner - 14)
        ds.ellipse([P(b - 1.9), P(b + 1.9)], fill=255)
    reg = np.asarray(region).astype(np.float32) / 255
    sol = np.asarray(solid).astype(np.float32) / 255
    a2 = np.maximum(sol, reg * net() * 0.55)
    small = lambda z: np.asarray(Image.fromarray((z * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    alpha = small(a2)
    height = small(ndimage.gaussian_filter(sol, 1.2 * S)) + alpha * 0.25
    thread = 0.86 + 0.14 * ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 0.7)
    return np.clip(alpha * thread, 0, 1), height


def vine(p0, p1, side, offset=70):
    """Embroidered vine with leaves, running parallel inside the lace."""
    p0, p1 = np.array(p0, float), np.array(p1, float)
    v = p1 - p0
    L = np.linalg.norm(v)
    u = v / L
    n = np.array([-u[1], u[0]]) * side
    m = canvas()
    dr = ImageDraw.Draw(m)
    pts = []
    for s in np.linspace(40, L - 40, 160):
        c = p0 + u * s - n * (offset + 10 * np.sin(s / 38))
        pts.append(tuple(c))
    dr.line(pts, fill=255, width=3)
    for k, s in enumerate(np.arange(60, L - 60, 46)):
        c = p0 + u * s - n * (offset + 10 * np.sin(s / 38))
        sgn = 1 if k % 2 else -1
        tip = c + u * 16 + n * 20 * sgn
        mid = c + u * 8 + n * 10 * sgn
        perp = np.array([-(tip - c)[1], (tip - c)[0]]) / np.linalg.norm(tip - c) * 6
        dr.polygon([tuple(c), tuple(mid + perp), tuple(tip), tuple(mid - perp)], fill=255)
        if k % 3 == 0:  # tiny five-dot flower
            f = c - n * 22 * sgn
            for a in range(5):
                q = f + 6 * np.array([np.cos(a * 1.2566), np.sin(a * 1.2566)])
                dr.ellipse((q[0] - 3, q[1] - 3, q[0] + 3, q[1] + 3), fill=255)
    return ndimage.gaussian_filter(arr(m), 0.7)


def apply_lace(img, lc, region=None):
    a, h = lc
    if region is not None:
        a, h = a * region, h * region
    sol = np.clip((a - 0.5) * 3, 0, 1)  # only the stitched parts throw a real shadow
    img = cast(img, sol, 3, 2, 2.5, 0.3)
    img = cast(img, a, 4, 3, 6, 0.08)
    dif, sp = shade(h, 3.5, spec=0.18, shin=14)
    col = np.clip(np.array([0.96, 0.94, 0.87]) * (0.72 + 0.32 * dif[..., None]) + sp[..., None] * 0.25, 0, 1)
    return over(img, col, a * 0.97)


def add_lace(*ls):
    return (np.clip(sum(l[0] for l in ls), 0, 1), sum(l[1] for l in ls))


def apply_vine(img, m, region=None):
    if region is not None:
        m = m * region
    dif, _ = shade(m, 5)
    col = np.clip(IVORY * (0.7 + 0.3 * dif[..., None]), 0, 1)
    img = cast(img, m, 2, 1, 1.5, 0.25)
    return over(img, col, m * 0.8)


PEARLS = []


def pearls(img, count, region, rmin=9, rmax=15, avoid=None, layer='base'):
    placed = []
    tries = 0
    while len(placed) < count and tries < 6000:
        tries += 1
        x, y = rng.uniform(30, W - 30), rng.uniform(30, H - 30)
        if region[int(y), int(x)] < 0.99:
            continue
        if avoid is not None and avoid(x, y):
            continue
        if any((x - a) ** 2 + (y - b) ** 2 < 90 ** 2 for a, b, _ in placed):
            continue
        placed.append((x, y, rng.uniform(rmin, rmax)))
    PEARLS.extend({'x': round(x / W * 100, 2), 'y': round(y / H * 100, 2), 'r': round(r, 1), 'layer': layer} for x, y, r in placed)
    for x, y, r in placed:
        x0, y0 = int(x - r * 3), int(y - r * 3)
        S = int(r * 6)
        sy, sx = np.mgrid[0:S, 0:S].astype(np.float32)
        dx, dy = (sx - S / 2) / r, (sy - S / 2) / r
        rr = dx ** 2 + dy ** 2
        a = np.clip((1 - rr) * r * 0.9, 0, 1)
        nz = np.sqrt(np.clip(1 - rr, 0, 1))
        L = np.array([-0.5, -0.7, 0.9])
        L /= np.linalg.norm(L)
        lam = np.clip(-dx * L[0] * -1 * -1 + 0, 0, 1)
        lam = np.clip(dx * L[0] + dy * L[1] + nz * L[2], 0, 1)
        spec = np.clip(dx * L[0] + dy * L[1] + nz * L[2], 0, 1) ** 40
        rim = (1 - nz) ** 3 * 0.25
        col = np.clip(np.array([0.96, 0.94, 0.9]) * (0.45 + 0.6 * lam[..., None]) + spec[..., None] * 0.7 + rim[..., None] * np.array([0.8, 0.85, 0.95]), 0, 1)
        sh = ndimage.gaussian_filter(ndimage.shift(a, (r * 0.5, r * 0.3), order=1), r * 0.35)
        reg = img[y0:y0 + S, x0:x0 + S]
        if reg.shape[:2] != (S, S):
            continue
        reg = reg * (1 - 0.5 * sh[..., None])
        img[y0:y0 + S, x0:x0 + S] = reg * (1 - a[..., None]) + col * a[..., None]
    return img


def text_mask(txt, font, size, cx, cy, w=W, h=H):
    m = Image.new('L', (w, h), 0)
    dr = ImageDraw.Draw(m)
    f = ImageFont.truetype(font, size)
    bb = dr.textbbox((0, 0), txt, font=f)
    dr.text((cx - (bb[2] - bb[0]) / 2 - bb[0], cy - (bb[3] - bb[1]) / 2 - bb[1]), txt, font=f, fill=255)
    return np.asarray(m).astype(np.float32) / 255


# ------------------------------------------------------------------ geometry
TL, TR, BL, BR = (0, 0), (W, 0), (0, H), (W, H)
TOP = (CX, TOP_TIP)
BOT = (CX, BOT_TIP)
LEFT_TIP = (CX - 6, CY)
RIGHT_TIP = (CX + 6, CY)

# ------------------------------------------------------------------ base
LINING = np.array([0.90, 0.87, 0.78], np.float32)
base = np.clip((LINING + grain * 0.35) * LIGHT, 0, 1) * (0.55 + 0.45 * np.clip(yy / (H * 0.5), 0, 1))[..., None]

left = poly([(-4, -4), LEFT_TIP, (-4, H + 4)])
right = poly([(W + 4, -4), RIGHT_TIP, (W + 4, H + 4)])
bottom = poly([(-4, H + 4), BOT, (W + 4, H + 4)])

base = cast(base, left, 0, 12, 14, 0.4)
base = over(base, olive(1.04), left)
base = cast(base, right, 0, -12, 14, 0.4)
base = over(base, olive(0.98), right)
base = cast(base, bottom, -14, 0, 16, 0.45)
base = over(base, olive(1.0) * np.clip(1.06 - 0.1 * (yy - BOT_TIP) / (H - BOT_TIP), 0.94, 1.08)[..., None], bottom)

# lace on the bottom flap's two edges, vines inside, pearls over the pocket
base = apply_lace(base, add_lace(lace(BL, BOT, -1), lace(BOT, BR, -1)))
base = apply_vine(base, vine(BL, BOT, -1) + vine(BOT, BR, -1), bottom)
pocket = np.clip(left + right + bottom, 0, 1)
base = pearls(base, 22, pocket, avoid=lambda x, y: abs(y - CY) < 260 and abs(x - CX) < 260)
# the inside of the envelope is left see-through, so the invitation shows
# through the opening as the flap lifts
base_lace_a = ndimage.maximum_filter(add_lace(lace(BL, BOT, -1), lace(BOT, BR, -1))[0], 3)
base_alpha = np.clip(np.maximum(pocket, base_lace_a), 0, 1)
Image.fromarray((np.dstack([np.clip(base, 0, 1), base_alpha]) * 255).astype(np.uint8), 'RGBA').save(f'{OUT}/env-base.webp', quality=86)

# ------------------------------------------------------------------ flap
fm = poly([(-6, -6), (W + 6, -6), TOP])
hard = (fm > 0.5).astype(np.float32)
flap = olive(1.08) * np.clip(1.07 - 0.12 * yy / TOP_TIP, 0.9, 1.08)[..., None]
flap_lace = add_lace(lace(TL, TOP, 1), lace(TOP, TR, 1))
flap = apply_lace(flap, flap_lace)
flap = apply_vine(flap, vine(TL, TOP, 1) + vine(TOP, TR, 1), hard)
flap = pearls(flap, 12, hard, layer='flap', avoid=lambda x, y: y > TOP_TIP - 330 and abs(x - CX) < 200)
# the lace hangs past the flap's cut edge, so widen its alpha to include it
lace_alpha = flap_lace[0]
alpha = np.clip(fm + lace_alpha, 0, 1)
Image.fromarray((np.dstack([np.clip(flap, 0, 1), alpha]) * 255).astype(np.uint8), 'RGBA').save(f'{OUT}/env-flap.webp', quality=88)

sh = ndimage.gaussian_filter(ndimage.shift(np.clip(hard + lace_alpha * 0.15, 0, 1), (16, 5), order=1), 18) * 0.42
lace_zone = ndimage.gaussian_filter(np.clip(ndimage.maximum_filter(lace_alpha, 9) * 3, 0, 1), 3)
sh = sh * (1 - 0.85 * lace_zone)
Image.fromarray((np.dstack([np.full((H, W, 3), 0.05, np.float32), sh]) * 255).astype(np.uint8), 'RGBA').save(f'{OUT}/env-flap-shadow.webp', quality=80)

# ------------------------------------------------------------------ tulle + seal
layer = np.zeros((H, W, 3), np.float32)
la = np.zeros((H, W), np.float32)
# four sheer swathes, wide at the corners, pinched at the seal
for (ex, ey) in [(-120, -200), (W + 120, -200), (-120, H + 200), (W + 120, H + 200)]:
    vx, vy = ex - CX, ey - CY
    Ln = np.hypot(vx, vy)
    ux, uy = vx / Ln, vy / Ln
    t = ((xx - CX) * ux + (yy - CY) * uy) / Ln  # 0 at seal, 1 at corner
    s = (-(xx - CX) * uy + (yy - CY) * ux)  # across the swathe
    width = 40 + 360 * np.clip(t, 0, 1) ** 0.7
    inside = np.clip(1 - np.abs(s) / width, 0, 1) * (t > -0.02)
    soft = np.clip(inside * 3, 0, 1) * np.clip((0.75 - t) * 3, 0, 1)
    pleat = 0.5 + 0.5 * np.cos(s / width * np.pi * 4 + 0.5)
    a = soft * (0.2 + 0.2 * pleat)
    layer = layer * (1 - a[..., None]) + (np.array([0.97, 0.96, 0.93]) * (0.85 + 0.15 * pleat[..., None])) * a[..., None]
    la = la + a * (1 - la)
mesh = 1 + 0.12 * ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 0.6)
la = np.clip(ndimage.gaussian_filter(la, 3) * mesh, 0, 1)

# the oval ivory seal
SW, SH_ = 360, 440
sy0, sx0 = int(CY - SH_ / 2), int(CX - SW / 2)
oy, ox = np.mgrid[0:SH_, 0:SW].astype(np.float32)
ex_ = (ox - SW / 2) / (SW * 0.43)
ey_ = (oy - SH_ / 2) / (SH_ * 0.43)
er = np.sqrt(ex_ ** 2 + ey_ ** 2)
ang = np.arctan2(ey_, ex_)
edge = 1 + 0.035 * np.sin(6 * ang + 0.4) + 0.025 * np.sin(11 * ang + 1.3)
blob = (er < edge).astype(np.float32)
h = np.clip(ndimage.distance_transform_edt(blob) / 34, 0, 1) ** 0.55
h -= 0.3 * (er < 0.78)
h += 0.22 * np.exp(-((er - 0.79) ** 2) / (2 * 0.018 ** 2))
h = ndimage.gaussian_filter(h, 2)
mono = text_mask('A&S', f'{FONTS}/Pinyon.ttf', 96, SW / 2, SH_ * 0.45, SW, SH_)
h += 0.22 * ndimage.gaussian_filter(mono, 1.4)
# olive sprig under the monogram: a curved stem with paired leaves
sp = Image.new('L', (SW, SH_), 0)
dr = ImageDraw.Draw(sp)
stem = [(SW / 2 - 80 + k * 4, SH_ * 0.70 - 18 * np.sin(k / 40 * np.pi)) for k in range(41)]
dr.line(stem, fill=255, width=3)
for k in range(4, 40, 6):
    x0, y0 = stem[k]
    for sgn in (-1, 1):
        lx, ly = x0 + 9, y0 + sgn * 11
        dr.polygon([(x0, y0), (lx - 3, ly - sgn * 1), (lx + 7, ly + sgn * 4), (lx + 1, ly + sgn * 6)], fill=255)
h += 0.16 * ndimage.gaussian_filter(arr(sp), 1.2)
h += ndimage.gaussian_filter(rng.standard_normal((SH_, SW)).astype(np.float32), 2) * 0.01
dif, spec = shade(h * 40, 1, spec=0.5, shin=26)
WAXI = np.array([0.93, 0.90, 0.83], np.float32)
seal_col = np.clip(WAXI * (0.5 + 0.55 * dif[..., None]) + spec[..., None] * 0.5, 0, 1)
seal_a = ndimage.gaussian_filter(blob, 0.9)
seal_sh = ndimage.gaussian_filter(ndimage.shift(blob, (14, 6), order=1), 11) * 0.55
reg_c = layer[sy0:sy0 + SH_, sx0:sx0 + SW]
reg_a = la[sy0:sy0 + SH_, sx0:sx0 + SW]
# shadow (as darkening with alpha), then the seal
reg_c = reg_c * (1 - seal_sh[..., None]) + 0.06 * seal_sh[..., None]
reg_a = reg_a + seal_sh * (1 - reg_a)
reg_c = reg_c * (1 - seal_a[..., None]) + seal_col * seal_a[..., None]
reg_a = reg_a + seal_a * (1 - reg_a)
layer[sy0:sy0 + SH_, sx0:sx0 + SW] = reg_c
la[sy0:sy0 + SH_, sx0:sx0 + SW] = reg_a
Image.fromarray((np.dstack([np.clip(layer, 0, 1), np.clip(la, 0, 1)]) * 255).astype(np.uint8), 'RGBA').save(f'{OUT}/env-seal.webp', quality=88)

# ------------------------------------------------------------------ preview
comp = base * base_alpha[..., None] + 0.2 * (1 - base_alpha[..., None])
for f in ['env-flap-shadow', 'env-flap', 'env-seal']:
    im = arr(Image.open(f'{OUT}/{f}.webp').convert('RGBA'))
    comp = comp * (1 - im[..., 3:]) + im[..., :3] * im[..., 3:]
Image.fromarray((np.clip(comp, 0, 1) * 255).astype(np.uint8)).resize((540, 1170)).save(sys.argv[4] if len(sys.argv) > 4 else f'{OUT}/preview.jpg', quality=88)
import json
if len(sys.argv) > 5:  # pearl positions for the glint animation (src/data/pearls.ts)
    open(sys.argv[5], 'w').write("/** Pearl positions on the opening envelope, in % of its canvas.\n *  Generated by scripts/render-lace-envelope.py — do not edit by hand. */\nexport const pearls: { x: number; y: number; r: number; layer: 'base' | 'flap' }[] = " + json.dumps(PEARLS) + "\n")
print('ok', len(PEARLS))
