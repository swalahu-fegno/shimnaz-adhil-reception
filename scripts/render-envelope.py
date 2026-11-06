"""Render the opening envelope as realistic image layers.

Layers share one canvas (W x H) so they stay aligned under background-size: cover.
  env-base.webp   opaque: inside lining + side flaps + bottom flap, with debossed line
  env-flap.webp   RGBA: top flap with gold-foil monogram
  env-seal.webp   RGBA: wax seal (+ its shadow) at the flap tip
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage

OUT = sys.argv[1]
TEX = sys.argv[2]
FONTS = sys.argv[3]
W, H = 1080, 2340
TIP_Y = int(H * 0.50)
rng = np.random.default_rng(9)

# ---------------------------------------------------------------- helpers
def tile(img, w, h, scale=1.6):
    t = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
    out = Image.new('RGB', (w, h))
    for x in range(0, w, t.width):
        for y in range(0, h, t.height):
            out.paste(t, (x, y))
    return np.asarray(out).astype(np.float32) / 255


def mask_poly(pts, blur=1.2):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    if blur:
        m = m.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(m).astype(np.float32) / 255


def shade(height, strength, light=(-0.55, -0.75, 1.0), spec=0.0, shin=30):
    gy, gx = np.gradient(height)
    n = np.dstack([-gx * strength, -gy * strength, np.ones_like(height)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    L = np.array(light, np.float32)
    L /= np.linalg.norm(L)
    lam = np.clip((n * L).sum(2), 0, 1)
    flat = L[2]
    diffuse = lam / flat  # 1.0 on flat surfaces
    s = 0
    if spec:
        Hh = L + np.array([0, 0, 1.0])
        Hh /= np.linalg.norm(Hh)
        s = spec * np.clip((n * Hh).sum(2), 0, 1) ** shin
    return diffuse, s


def lighting(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    # soft window light from the top-left, gentle vignette
    d = np.sqrt(((x - w * 0.3) / w) ** 2 + ((y - h * 0.22) / h) ** 2)
    light = 1.12 - 0.42 * d
    vig = np.sqrt(((x - w / 2) / (w * 0.75)) ** 2 + ((y - h / 2) / (h * 0.7)) ** 2)
    light *= 1 - 0.28 * np.clip(vig - 0.55, 0, 1)
    return light[..., None]


def text_mask(text, font, size, cx, cy, canvas=(W, H), spacing=0):
    m = Image.new('L', canvas, 0)
    d = ImageDraw.Draw(m)
    f = ImageFont.truetype(font, size)
    lines = text.split('\n')
    lh = size * 1.15
    for i, line in enumerate(lines):
        bb = d.textbbox((0, 0), line, font=f)
        tw = bb[2] - bb[0]
        y = cy - lh * len(lines) / 2 + i * lh
        d.text((cx - tw / 2 - bb[0], y), line, font=f, fill=255)
    return np.asarray(m).astype(np.float32) / 255


paper = tile(Image.open(TEX).convert('RGB'), W, H)
# re-centre the texture's colour on a soft sage olive, keep its grain
grain = paper - paper.mean(axis=(0, 1))
OLIVE = np.array([0.47, 0.47, 0.30], np.float32)
LIGHT = lighting(H, W)


def paper_layer(tone=1.0, tint=(0, 0, 0)):
    return np.clip((OLIVE * tone + np.array(tint, np.float32) + grain * 1.15) * LIGHT, 0, 1)


# ---------------------------------------------------------------- base
# Inside of the envelope: cream lining, shadowed under the flap
LINING = np.array([0.90, 0.87, 0.78], np.float32)
inside = np.clip((LINING + grain * 0.35) * LIGHT, 0, 1)
yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
inside *= (0.55 + 0.45 * np.clip(yy / (H * 0.55), 0, 1))[..., None]
base = inside.copy()

left_pts = [(0, -4), (W * 0.5 + 6, TIP_Y + 70), (0, H + 4)]
right_pts = [(W, -4), (W * 0.5 - 6, TIP_Y + 70), (W, H + 4)]
bottom_pts = [(-4, H), (W * 0.5, H * 0.455), (W + 4, H)]


def lay(base, pts, col, cast=True, ridge=True):
    m = mask_poly(pts)
    if cast:  # the flap's own shadow on what's beneath
        sh = mask_poly(pts, blur=0)
        sh = ndimage.shift(sh, (14, 4), order=1)
        sh = ndimage.gaussian_filter(sh, 16)
        base = base * (1 - 0.42 * sh[..., None])
    out = base * (1 - m[..., None]) + col * m[..., None]
    if ridge:  # paper edge catching the light
        edge = np.clip(m - ndimage.uniform_filter(m, 5) , 0, 1)
        e = ndimage.gaussian_filter((mask_poly(pts, 0) > 0.5).astype(np.float32), 1.1)
        rim = np.clip(e * (1 - e) * 4, 0, 1)
        out = out + rim[..., None] * 0.10
    return np.clip(out, 0, 1)


base = lay(base, left_pts, paper_layer(1.04, (0.01, 0.01, 0)))
base = lay(base, right_pts, paper_layer(0.98))
bottom_col = paper_layer(1.0, (0.0, 0.005, 0))
# the bottom flap is slightly bowed: lighter at its top edge
bshade = np.clip(1.06 - 0.10 * (yy - H * 0.47) / (H * 0.53), 0.92, 1.08)[..., None]
base = lay(base, bottom_pts, bottom_col * bshade)

# debossed line on the bottom flap
deb = text_mask('Request the pleasure\nof your company', f'{FONTS}/Pinyon.ttf', 78, W / 2, H * 0.715)
dh = -ndimage.gaussian_filter(deb, 1.6)
dif, _ = shade(dh, 5)
base = np.clip(base * (0.45 + 0.55 * dif[..., None]) * (1 - 0.07 * deb[..., None]), 0, 1)

Image.fromarray((base * 255).astype(np.uint8)).save(f'{OUT}/env-base.webp', quality=86)

# ---------------------------------------------------------------- flap
# soft, rounded tip
flap_img = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(flap_img)
tip_r = 70
pts = [(-6, -6), (W + 6, -6)]
# right edge down to the rounded tip
for t in np.linspace(0, 1, 60):
    pass
d.polygon([(-6, -6), (W + 6, -6), (W / 2 + tip_r * 0.9, TIP_Y - tip_r * 0.55), (W / 2 - tip_r * 0.9, TIP_Y - tip_r * 0.55)], fill=255)
d.ellipse((W / 2 - tip_r * 1.05, TIP_Y - tip_r * 2.0, W / 2 + tip_r * 1.05, TIP_Y + 2), fill=255)
fm = np.asarray(flap_img.filter(ImageFilter.GaussianBlur(1.3))).astype(np.float32) / 255

flap_col = paper_layer(1.08, (0.012, 0.012, 0.0))
# gentle curvature: brighter near the top, a touch darker toward the tip
fshade = np.clip(1.07 - 0.12 * yy / TIP_Y, 0.9, 1.08)[..., None]
flap_col = flap_col * fshade

# edge: thickness highlight along the cut edges + slight darkening just inside
hard = (fm > 0.5).astype(np.float32)
inner = ndimage.gaussian_filter(hard, 6)
rim = np.clip((1 - inner) * hard * 2.2, 0, 1)
flap_col = flap_col * (1 - 0.18 * rim[..., None]) + 0.0
edge_line = np.clip(ndimage.gaussian_filter(hard, 0.9) - ndimage.gaussian_filter(hard, 2.2), 0, 1) * hard
flap_col = np.clip(flap_col + edge_line[..., None] * 0.55, 0, 1)

# gold-foil monogram, hot-stamped (slightly pressed in, foil catches light)
mono = text_mask('A&S', f'{FONTS}/Pinyon.ttf', 220, W / 2, TIP_Y * 0.40)
press = -ndimage.gaussian_filter(mono, 3.0) * 0.6  # paper pushed down around the foil
flap_dif, _ = shade(press, 10)
flap_col = flap_col * flap_dif[..., None]
fh = ndimage.gaussian_filter(mono, 1.4)
fdif, fspec = shade(fh, 14, spec=1.0, shin=18)
gx = np.linspace(0, 1, W)[None, :]
gold_a = np.array([0.62, 0.47, 0.27])
gold_b = np.array([0.95, 0.83, 0.58])
band = (0.5 + 0.5 * np.sin(gx * 9 + yy[..., :1] * 0.004 * 0 + 1.2))[..., None]
gold = gold_a * (1 - band) + gold_b * band
foil_noise = ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 0.8)[..., None] * 0.04
foil = np.clip(gold * (0.55 + 0.55 * fdif[..., None]) + fspec[..., None] * 0.9 + foil_noise, 0, 1)
flap_col = flap_col * (1 - mono[..., None]) + foil * mono[..., None]

rgba = np.dstack([np.clip(flap_col, 0, 1), fm])
Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(f'{OUT}/env-flap.webp', quality=88)

# shadow the flap throws on the pocket (its own layer, so it can fade)
sh = ndimage.shift(hard, (22, 6), order=1)
sh = ndimage.gaussian_filter(sh, 22) * 0.55
sh_rgba = np.dstack([np.zeros((H, W, 3), np.float32) + 0.05, sh])
Image.fromarray((sh_rgba * 255).astype(np.uint8), 'RGBA').save(f'{OUT}/env-flap-shadow.webp', quality=80)

# ---------------------------------------------------------------- seal
S = 520
cy_, cx_ = np.mgrid[0:S, 0:S].astype(np.float32)
ang = np.arctan2(cy_ - S / 2, cx_ - S / 2)
rad = np.hypot(cx_ - S / 2, cy_ - S / 2)
wob = 180 + 9 * np.sin(5 * ang + 0.7) + 6 * np.sin(9 * ang + 2.1) + 4 * np.sin(14 * ang)
blob = (rad < wob).astype(np.float32)
dist = ndimage.distance_transform_edt(blob)
h = np.clip(dist / 46, 0, 1) ** 0.55
# recessed disc with a raised rim ring, raised monogram inside
ring_r = 128
h -= 0.32 * (rad < ring_r - 4)
h += 0.22 * np.exp(-((rad - ring_r) ** 2) / (2 * 5 ** 2))
h = ndimage.gaussian_filter(h, 2.2)
smono = text_mask('A&S', f'{FONTS}/Pinyon.ttf', 150, S / 2, S / 2 + 6, canvas=(S, S))
h += 0.2 * ndimage.gaussian_filter(smono, 1.6)
h += ndimage.gaussian_filter(rng.standard_normal((S, S)).astype(np.float32), 2) * 0.012
dif, spec = shade(h * 40, 1.0, light=(-0.6, -0.8, 1.0), spec=0.55, shin=22)
WAX = np.array([0.40, 0.22, 0.13], np.float32)
var = 1 + ndimage.gaussian_filter(rng.standard_normal((S, S)).astype(np.float32), 18)[..., None] * 0.6
col = np.clip(WAX * var * (0.35 + 0.75 * dif[..., None]) + spec[..., None] * 0.55, 0, 1)
alpha = ndimage.gaussian_filter(blob, 1.0)
# its shadow on the paper
shadow = ndimage.gaussian_filter(ndimage.shift(blob, (16, 7), order=1), 12) * 0.6
a_out = alpha + shadow * (1 - alpha)
c_out = (col * alpha[..., None] + 0.04 * (shadow * (1 - alpha))[..., None]) / np.maximum(a_out[..., None], 1e-4)
seal_small = np.dstack([np.clip(c_out, 0, 1), a_out])
seal_full = np.zeros((H, W, 4), np.float32)
sy, sx = TIP_Y - S // 2 - 8, W // 2 - S // 2
seal_full[sy:sy + S, sx:sx + S] = seal_small
Image.fromarray((seal_full * 255).astype(np.uint8), 'RGBA').save(f'{OUT}/env-seal.webp', quality=90)

# preview composite
comp = base.copy()
for f in ['env-flap-shadow', 'env-flap', 'env-seal']:
    im = np.asarray(Image.open(f'{OUT}/{f}.webp').convert('RGBA')).astype(np.float32) / 255
    comp = comp * (1 - im[..., 3:]) + im[..., :3] * im[..., 3:]
Image.fromarray((comp * 255).astype(np.uint8)).resize((540, 1170)).save(f'{OUT}/../preview.jpg', quality=88)
print('ok')
