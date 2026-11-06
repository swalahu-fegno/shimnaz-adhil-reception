import { memo, useEffect, useLayoutEffect, useRef } from 'react'
/**
 * The hero landscape, painted entirely in code (SVG) — no image.
 *
 * Same composition as the groom side's painting: a hazy cream sky, misty
 * blue-green mountains, rolling olive hills, three cypresses on the left, a
 * great spreading tree right of centre and mossy ground in front. Foliage is
 * built from thousands of small leaf dabs lit from the upper left, and every
 * edge is roughened by a brush filter so it reads as painted.
 *
 * Shapes come from a seeded random, so every visit paints the same scene.
 */

const W = 900
const H = 1350

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

/** A soft ridge line closed down to `bottom`. */
function ridge(seed: number, y: number, amp: number, freq: number, bottom = H) {
  const r = seeded(seed)
  const ph = [r() * 6, r() * 6, r() * 6]
  let d = `M-40 ${bottom} L-40 ${y}`
  for (let x = -40; x <= W + 40; x += 12) {
    const yy =
      y - amp * Math.sin(x * freq + ph[0]) - amp * 0.45 * Math.sin(x * freq * 2.3 + ph[1]) - amp * 0.18 * Math.sin(x * freq * 5.1 + ph[2])
    d += ` L${x} ${yy.toFixed(1)}`
  }
  return d + ` L${W + 40} ${bottom} Z`
}

type Dab = { x: number; y: number; rx: number; ry: number; a: number; c: string }

/** Leaf dabs over elliptical clusters, toned by light from the upper left. */
function foliage(seed: number, clusters: number[][], density: number, tones: string[], size = 1): Dab[] {
  const r = seeded(seed)
  const out: Dab[] = []
  for (const [cx, cy, rx, ry] of clusters) {
    const n = Math.round(rx * ry * density)
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2
      const d = Math.sqrt(r())
      const x = cx + Math.cos(a) * rx * d
      const y = cy + Math.sin(a) * ry * d
      const lit = (-(x - cx) / rx - (y - cy) / ry) * 0.42 + 0.5 + (r() - 0.5) * 0.45
      const k = Math.max(0, Math.min(tones.length - 1, Math.floor(lit * tones.length)))
      out.push({ x, y, rx: (3 + r() * 4.5) * size, ry: (1.8 + r() * 2) * size, a: r() * 180, c: tones[k] })
    }
  }
  return out.sort((p, q) => tones.indexOf(p.c) - tones.indexOf(q.c))
}

const TREE_TONES = ['#2f3622', '#3f4a2c', '#535f38', '#6b7546', '#858c5a', '#a6a677']
const TREE = foliage(
  11,
  [
    [600, 560, 160, 90],
    [470, 610, 100, 62],
    [745, 630, 115, 62],
    [545, 505, 95, 62],
    [670, 495, 100, 62],
    [610, 450, 75, 45],
    [810, 705, 95, 46],
    [440, 690, 65, 36],
    [600, 650, 120, 50],
  ],
  0.09,
  TREE_TONES,
  1.4,
)
const CYPRESS_TONES = ['#232b18', '#2f3a22', '#3e4a2c', '#55623b']
const CYPRESSES = [
  { x: 55, top: 600, bottom: 1040, w: 46 },
  { x: 175, top: 670, bottom: 1060, w: 42 },
  { x: 300, top: 690, bottom: 1060, w: 38 },
]
const CYPRESS_DABS = CYPRESSES.map((c, i) => {
  const r = seeded(40 + i)
  const out: Dab[] = []
  for (let k = 0; k < 900; k++) {
    const t = r()
    const y = c.top + t * (c.bottom - c.top)
    const half = c.w * Math.sin(Math.min(Math.PI, t * Math.PI * 1.15) + 0.15) * (0.55 + 0.45 * t)
    const x = c.x + (r() * 2 - 1) * half
    const lit = 0.5 - (x - c.x) / (c.w * 2) + (r() - 0.5) * 0.5
    const kk = Math.max(0, Math.min(3, Math.floor(lit * 4)))
    out.push({ x, y, rx: 3 + r() * 3, ry: 2 + r() * 1.5, a: 60 + r() * 60, c: CYPRESS_TONES[kk] })
  }
  return out.sort((p, q) => CYPRESS_TONES.indexOf(p.c) - CYPRESS_TONES.indexOf(q.c))
})
const BUSH_TONES = ['#2c3420', '#3b4629', '#4f5b35', '#677248', '#8a8f5f']
const BUSHES = foliage(
  70,
  [
    [130, 1080, 170, 60],
    [60, 1150, 90, 50],
    [560, 1140, 110, 46],
    [820, 1080, 110, 70],
  ],
  0.05,
  BUSH_TONES,
  1.3,
)

// distant trees dotted along the far hills
const FAR_TREES = (() => {
  const r = seeded(91)
  const out: number[][] = []
  for (let i = 0; i < 26; i++) {
    const x = r() * W
    const y = 870 + r() * 40
    out.push([x, y, 8 + r() * 10, 6 + r() * 5])
  }
  return out
})()
const FAR_DABS = foliage(92, FAR_TREES, 0.35, ['#4a5338', '#5b6544', '#717a55', '#8b9068'], 0.7)
// wildflowers scattered through the meadows
const WILD = (() => {
  const r = seeded(93)
  return Array.from({ length: 140 }, () => {
    const x = r() * W
    const y = 930 + r() * 300
    const c = ['#efe4d0', '#e6c8c2', '#ecdca8', '#f7f2e6'][Math.floor(r() * 4)]
    return { x, y, s: 1.2 + r() * 2.2 * ((y - 900) / 300), c }
  })
})()

// roses and greenery climbing the arch
const ARCH_DABS = (() => {
  const r = seeded(95)
  const out: Dab[] = []
  const pt = (t: number) => {
    // along the arch: left post up, over the crown, down the right post
    if (t < 0.3) return [405, 1080 - (t / 0.3) * 105]
    if (t > 0.7) return [505, 975 + ((t - 0.7) / 0.3) * 105]
    const a = Math.PI * (1 - (t - 0.3) / 0.4)
    return [455 + Math.cos(a) * 50, 975 - Math.sin(a) * 45]
  }
  const tones = ['#3d4a2c', '#55623b', '#6f7a4b', '#f3ece0', '#e6c4c0', '#f8f3ea']
  for (let i = 0; i < 520; i++) {
    const t = r()
    const heavy = t > 0.25 && t < 0.75 ? 1 : 0.55
    if (r() > heavy) continue
    const [x, y] = pt(t)
    const flower = r() < 0.38
    out.push({
      x: x + (r() - 0.5) * 22,
      y: y + (r() - 0.5) * 18,
      rx: flower ? 3.4 : 4.2,
      ry: flower ? 3.2 : 2,
      a: r() * 180,
      c: flower ? tones[3 + Math.floor(r() * 3)] : tones[Math.floor(r() * 3)],
    })
  }
  return out
})()
// bulbs hanging along two strands of fairy lights
const LIGHTS = [
  ...Array.from({ length: 11 }, (_, i) => {
    const t = i / 10
    return { x: (1 - t) ** 2 * 610 + 2 * (1 - t) * t * 700 + t * t * 820, y: (1 - t) ** 2 * 700 + 2 * (1 - t) * t * 790 + t * t * 760 }
  }),
  ...Array.from({ length: 11 }, (_, i) => {
    const t = i / 10
    return { x: (1 - t) ** 2 * 560 + 2 * (1 - t) * t * 470 + t * t * 360, y: (1 - t) ** 2 * 720 + 2 * (1 - t) * t * 820 + t * t * 790 }
  }),
]

// The ceremony garden, painted in the scene's own style and perspective:
// low clipped hedges running beside the aisle, rose bushes either side of the
// arch, and a soft flower border in the foreground.
const HEDGE_TONES = ['#2c3520', '#38442a', '#4a5634', '#5f6b40', '#7a8452']
const HEDGES = foliage(
  120,
  Array.from({ length: 16 }, (_, i) => {
    const t = i / 15 // 0 at the arch, 1 at the front
    const side = i % 2 ? 1 : -1
    const k = Math.floor(i / 2) / 7
    const y = 1085 + k * 230
    const x = 455 + side * (80 + k * 210)
    return [x, y, 30 + k * 55, 9 + k * 14]
  }).concat([
    [395, 1080, 40, 10],
    [515, 1080, 40, 10],
  ]),
  0.12,
  HEDGE_TONES,
  1,
)
const ROSE_PALETTE = ['#efe6da', '#e3c5bf', '#d4a7a3', '#f6f1e6']
const HEDGE_ROSES = (() => {
  const r = seeded(121)
  return Array.from({ length: 170 }, () => {
    const k = r()
    const side = r() < 0.5 ? -1 : 1
    const y = 1080 + k * 230 - 6 - r() * (8 + k * 12)
    const x = 455 + side * (80 + k * 210) + (r() - 0.5) * (50 + k * 100)
    return { x, y, s: 1.4 + k * 2.6, c: ROSE_PALETTE[Math.floor(r() * 4)] }
  })
})()
const BUSHES_ARCH = foliage(
  122,
  [
    [372, 1062, 34, 22],
    [538, 1062, 34, 22],
  ],
  0.22,
  HEDGE_TONES,
  0.9,
)
const BORDER = foliage(
  123,
  [
    [70, 1320, 160, 40],
    [830, 1320, 160, 40],
    [250, 1340, 120, 22],
    [660, 1340, 120, 22],
  ],
  0.05,
  HEDGE_TONES,
  2,
)
const BORDER_FLOWERS = (() => {
  const r = seeded(124)
  return Array.from({ length: 90 }, () => {
    const left = r() < 0.5
    const x = left ? r() * 300 - 20 : 600 + r() * 320
    const y = 1290 + r() * 60
    return { x, y, s: 3 + r() * 4, c: ROSE_PALETTE[Math.floor(r() * 4)] }
  })
})()

function Dabs({ list }: { list: Dab[] }) {
  return (
    <>
      {list.map((d, i) => (
        <ellipse
          key={i}
          cx={d.x.toFixed(1)}
          cy={d.y.toFixed(1)}
          rx={d.rx.toFixed(1)}
          ry={d.ry.toFixed(1)}
          transform={`rotate(${d.a.toFixed(0)} ${d.x.toFixed(1)} ${d.y.toFixed(1)})`}
          fill={d.c}
        />
      ))}
    </>
  )
}

// The painted garden is pre-drawn: each brush/leaf-filtered part of the SVG
// was rendered once to a WebP (public/images/hero). On mount every filtered
// part is swapped for its picture before the first paint, so the phone never
// runs the heavy noise filters — it only slides pictures on scroll.
const NS = 'http://www.w3.org/2000/svg'
const HERO_IMG = `${import.meta.env.BASE_URL}images/hero/`
const SCENE_URL = `${HERO_IMG}scene.webp`
// [x, y, w, h] in scene units, in the same order the walk below finds them
const BAKED: [number, number, number, number][] = [
  [-54, -54, 1008, 628], [247.6, -102.4, 844.8, 1164.8], [-98.8, 513.8, 1097.6, 445],
  [-98.8, 725.6, 1097.6, 683.2], [59.6, 903.6, 380.8, 92.8], [-72.1, 804.1, 1033.4, 177.7],
  [-11, 567.4, 369.9, 526.4], [-102.1, 552.1, 1099.2, 712.9], [28.4, 1019.4, 854.3, 369],
  [306.3, 898, 297.5, 382.5], [-203.5, 936.4, 1187.2, 377.2], [-161.2, 1201.1, 1223.4, 240.4],
]

// parts that animate on their own stay live (they are cheap: no filters)
const LIVE = '.hs-shimmer, .hs-lights, .hs-bulb'

function bakeLayers(svg: SVGSVGElement) {
  const targets: Element[] = []
  const walk = (el: Element) => {
    if (el.matches(LIVE)) return
    const filtered = el.hasAttribute('filter') || !!el.querySelector('[filter]')
    if (!filtered) return
    if (!el.querySelector(LIVE)) return void targets.push(el)
    Array.from(el.children).forEach(walk)
  }
  Array.from(svg.children).forEach((c) => c.tagName !== 'defs' && walk(c))
  if (targets.length !== BAKED.length) return // scene changed: re-export the images
  targets.forEach((el, i) => {
    const [x, y, w, h] = BAKED[i]
    const img = document.createElementNS(NS, 'image')
    img.setAttribute('href', `${HERO_IMG}l${i}.webp`)
    img.setAttribute('x', String(x))
    img.setAttribute('y', String(y))
    img.setAttribute('width', String(w))
    img.setAttribute('height', String(h))
    img.setAttribute('preserveAspectRatio', 'none')
    const g = document.createElementNS(NS, 'g')
    const cls = el.getAttribute('class')
    const opacity = el.getAttribute('opacity')
    if (cls) g.setAttribute('class', cls)
    if (opacity) g.setAttribute('opacity', opacity)
    g.appendChild(img)
    el.replaceWith(g)
  })
  svg.classList.add('is-baked')
}

/** A still image of the garden, for places that only need to show it. */
export function HeroSceneStill({ className = '' }: { className?: string }) {
  return (
    <div className={`hp hp-still ${className}`} aria-hidden="true">
      <img src={SCENE_URL} alt="" draggable={false} decoding="async" loading="lazy" />
    </div>
  )
}

export const HeroScene = memo(function HeroScene({ className = '' }: { className?: string }) {
  // parallax: as the hero scrolls away, far layers lag and near ones lead
  const ref = useRef<HTMLDivElement>(null)
  // swap in the pre-drawn pictures before the first paint
  useLayoutEffect(() => {
    const svg = ref.current?.querySelector('svg.hp-svg') as SVGSVGElement | null
    if (svg && !svg.classList.contains('is-baked')) bakeLayers(svg)
  }, [])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        // progress through the pinned hero: 0 at the top, 1 when the
        // invitation has fully taken over
        const sec = document.getElementById('hero')
        const run = sec ? sec.offsetHeight - window.innerHeight : window.innerHeight
        const y = window.scrollY - (sec?.offsetTop ?? 0)
        const p = Math.max(0, Math.min(1, y / (run * 0.5)))
        // phase 2: the invitation lifts away as the next page rises over it
        const p2 = Math.max(0, Math.min(1, (y - run * 0.5) / (run * 0.5)))
        // scoped to the hero, so a scroll restyles only the hero, not the page
        sec?.style.setProperty('--hero-p', p.toFixed(3))
        sec?.style.setProperty('--hero-p2', p2.toFixed(3))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return (
    <div ref={ref} className={`hp ${className}`} aria-hidden="true">
      <svg className="hp-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9bcac" />
            <stop offset="0.3" stopColor="#ddd2c0" />
            <stop offset="0.5" stopColor="#e7ded0" />
          </linearGradient>
          <linearGradient id="hs-mtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fa99a" />
            <stop offset="1" stopColor="#b9c0b0" />
          </linearGradient>
          <linearGradient id="hs-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b6239" />
            <stop offset="1" stopColor="#3e4428" />
          </linearGradient>
          <linearGradient id="hs-mound" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7d8460" />
            <stop offset="1" stopColor="#4e5434" />
          </linearGradient>
          <linearGradient id="hs-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ece7d8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ece7d8" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ece7d8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="hs-vig" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.6" stopColor="#1d1c10" stopOpacity="0" />
            <stop offset="1" stopColor="#1d1c10" stopOpacity="0.4" />
          </radialGradient>
          <filter id="hs-brush" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="10" />
          </filter>
          <filter id="hs-leaf" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="9" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
          <filter id="hs-haze">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="hs-cloud">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="4" seed="7" />
            <feColorMatrix values="0 0 0 0 0.97  0 0 0 0 0.95  0 0 0 0 0.9  0 0 0 0.9 -0.35" />
          </filter>
          <pattern id="hs-grain-tile" width="256" height="256" patternUnits="userSpaceOnUse">
            <image href={`${HERO_IMG}grain.webp`} width="256" height="256" />
          </pattern>
          <filter id="hs-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="2" />
            <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 0.14 0" />
          </filter>
        </defs>

        {/* sky with painted cloud wisps */}
        <rect className="pl pl-0" x="0" y="-400" width={W} height={H + 400} fill="url(#hs-sky)" />
        <rect className="pl pl-0" width={W} height="520" filter="url(#hs-cloud)" opacity="0.55" />
        {/* soft rays of light falling from the upper right */}
        <g className="hs-rays" opacity="0.35" filter="url(#hs-haze)">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${980 - i * 70} -40 L${640 - i * 110} 1000 L${700 - i * 110} 1000 L${1030 - i * 70} -40Z`} fill="#fff7e2" opacity={0.5 - i * 0.08} />
          ))}
        </g>

        {/* misty mountains */}
        <g className="pl pl-1" filter="url(#hs-haze)">
          <path d={ridge(1, 640, 60, 0.006, 900)} fill="url(#hs-mtn)" />
          <path d={ridge(2, 700, 30, 0.01, 900)} fill="#a8b2a3" opacity="0.9" />
        </g>
        <rect className="hs-mist" x="-80" y="650" width={W + 160} height="140" fill="url(#hs-mist)" />

        {/* rolling hills */}
        <g className="pl pl-2" filter="url(#hs-brush)">
          <path d={ridge(3, 820, 26, 0.008, H)} fill="url(#hs-hill)" />
          <path d={ridge(4, 900, 18, 0.012, H)} fill="#4b5232" />
          <path d="M240 1010 C420 930 700 920 900 990 L900 1350 L240 1350Z" fill="url(#hs-mound)" />
          <path d="M-40 1120 C120 1060 300 1080 420 1170 L420 1350 L-40 1350Z" fill="#5b6340" />
        </g>
        <rect className="hs-mist" x="-80" y="860" width={W + 160} height="90" fill="url(#hs-mist)" opacity="0.5" />

        <g className="pl pl-2">
        {/* a still lake catching the sky */}
        <g filter="url(#hs-brush)">
          <ellipse cx="250" cy="950" rx="170" ry="26" fill="#a9b3a6" />
          <ellipse cx="250" cy="946" rx="150" ry="16" fill="#cdd2c4" opacity="0.8" />
        </g>
        <g className="hs-shimmer">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={140 + i * 42} y={940 + (i % 2) * 8} width="26" height="1.6" rx="1" fill="#f4f1e6" opacity="0.8" />
          ))}
        </g>

        {/* trees dotted along the far hills */}
        <g filter="url(#hs-leaf)" opacity="0.85">
          {FAR_TREES.map(([x, y, , ry], i) => (
            <rect key={i} x={x - 1.2} y={y} width="2.4" height={ry + 8} fill="#4a4636" />
          ))}
          <Dabs list={FAR_DABS} />
        </g>

        </g>
        <g className="pl pl-4">
        {/* wildflowers in the grass */}
        <g>
          {WILD.map((w, i) => (
            <circle key={i} cx={w.x.toFixed(1)} cy={w.y.toFixed(1)} r={w.s.toFixed(1)} fill={w.c} opacity="0.85" />
          ))}
        </g>

        {/* cypresses */}
        </g>
        <g className="pl pl-3 pl-left"><g className="hs-cypress" filter="url(#hs-leaf)">
          {CYPRESSES.map((c, i) => (
            <path
              key={`s${i}`}
              d={`M${c.x} ${c.top} C${c.x + c.w * 0.6} ${c.top + 120} ${c.x + c.w} ${c.bottom - 140} ${c.x + c.w * 0.7} ${c.bottom} L${c.x - c.w * 0.7} ${c.bottom} C${c.x - c.w} ${c.bottom - 140} ${c.x - c.w * 0.6} ${c.top + 120} ${c.x} ${c.top}Z`}
              fill="#2a3320"
            />
          ))}
          {CYPRESS_DABS.map((list, i) => (
            <Dabs key={i} list={list} />
          ))}
        </g>

        </g>
        {/* the great tree */}
        <g className="pl pl-3 pl-right"><g transform="translate(740 905) scale(0.58) translate(-590 -905)">
        <g className="hs-tree">
          <g filter="url(#hs-brush)">
            <path
              d="M560 900 C566 840 572 780 566 730 C560 690 536 660 500 636 L510 628 C540 644 560 662 574 690 C576 660 584 630 600 606 L610 612 C598 640 594 670 596 700 C614 668 646 646 690 634 L694 642 C650 656 620 682 610 716 C600 760 604 830 616 900Z"
              fill="#5a5340"
            />
            <path d="M566 900 C572 840 572 780 568 734 L580 732 C586 780 586 840 584 900Z" fill="#8a816a" opacity="0.6" />
            <path d="M600 720 C660 700 720 690 790 700 L790 708 C720 700 660 710 604 730Z" fill="#544d3b" />
          </g>
          <g className="hs-canopy" filter="url(#hs-leaf)">
            <Dabs list={TREE} />
          </g>
        </g>
        </g>

        {/* bushes and the meadow in front */}
        <g className="pl pl-4">
        <g className="hs-bush" filter="url(#hs-leaf)">
          <Dabs list={BUSHES} />
        </g>
        </g>
        </g>
        {/* clipped hedges lining the aisle, with roses in bloom */}
        <g className="pl pl-4"><g className="hs-garden" filter="url(#hs-leaf)">
          <Dabs list={HEDGES} />
          {HEDGE_ROSES.map((f, i) => (
            <circle key={i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} r={f.s.toFixed(1)} fill={f.c} />
          ))}
        </g>

        </g>
        {/* the ceremony: a floral arch, an aisle runner and rows of chairs */}
        <g className="pl pl-4 hs-wedding">
          {/* aisle runner */}
          <path d="M440 1080 L470 1080 L520 1260 L392 1260Z" fill="#ece5d2" opacity="0.85" filter="url(#hs-brush)" />
          {/* petals scattered on the aisle */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <circle key={i} cx={430 + ((i * 37) % 70)} cy={1100 + i * 15} r="2" fill={i % 2 ? '#e6c4c0' : '#f6efe2'} />
          ))}
          {/* chairs, both sides of the aisle */}
          {[0, 1, 2, 3].map((row) =>
            [-1, 1].map((side) =>
              [0, 1, 2].map((k) => {
                const y = 1100 + row * 34
                const spread = 1 + row * 0.18
                const x = 455 + side * (34 + k * 22) * spread
                const s = 0.8 + row * 0.12
                return (
                  <g key={`${row}${side}${k}`} transform={`translate(${x} ${y}) scale(${s})`}>
                    <rect x="-7" y="-14" width="14" height="10" rx="2" fill="#f4efe2" />
                    <rect x="-7" y="-4" width="14" height="3" fill="#e2d9c2" />
                    <rect x="-6" y="-1" width="1.6" height="9" fill="#d8cfb6" />
                    <rect x="4.4" y="-1" width="1.6" height="9" fill="#d8cfb6" />
                    {k === 0 && <circle cx={-side * 7} cy="-12" r="3" fill="#e9c9c3" />}
                  </g>
                )
              }),
            ),
          )}
          {/* the floral arch at the head of the aisle */}
          <g filter="url(#hs-leaf)">
            <path d="M405 1080 L405 975 C405 915 505 915 505 975 L505 1080" stroke="#f1ead8" strokeWidth="5" fill="none" />
            <path d="M412 1080 L412 977 C412 925 498 925 498 977 L498 1080" stroke="#d9cfb4" strokeWidth="2" fill="none" />
            <Dabs list={ARCH_DABS} />
          </g>
          {/* draped tulle */}
          <path d="M408 960 C430 1000 440 1040 432 1080 M502 960 C480 1000 470 1040 478 1080" stroke="#fbf7ee" strokeWidth="6" fill="none" opacity="0.55" filter="url(#hs-haze)" />
        </g>

        <g className="pl pl-right">
        {/* fairy lights strung from the tree */}
        <g className="hs-lights" transform="translate(740 905) scale(0.58) translate(-590 -905)">
          <path d="M610 700 Q700 790 820 760 M560 720 Q470 820 360 790" stroke="#4d4734" strokeWidth="1" fill="none" opacity="0.7" />
          {LIGHTS.map((l, i) => (
            <circle key={i} className="hs-bulb" cx={l.x.toFixed(1)} cy={l.y.toFixed(1)} r="3.2" fill="#fff3c8" style={{ animationDelay: `${(i * 0.37) % 3}s` }} />
          ))}
        </g>

        </g>
        <g className="pl pl-4">
        <g filter="url(#hs-leaf)">
          <Dabs list={BUSHES_ARCH} />
        </g>

        {/* mossy boulders */}
        <g filter="url(#hs-brush)">
          <ellipse cx="760" cy="1185" rx="95" ry="48" fill="#6d6b55" />
          <ellipse cx="740" cy="1168" rx="70" ry="26" fill="#9a9478" opacity="0.8" />
          <ellipse cx="770" cy="1150" rx="40" ry="12" fill="#7c8656" opacity="0.8" />
          <ellipse cx="350" cy="1220" rx="60" ry="30" fill="#66654f" />
          <ellipse cx="338" cy="1208" rx="40" ry="14" fill="#958f73" opacity="0.8" />
        </g>
        <rect className="hs-mist" x="-80" y="1000" width={W + 160} height="80" fill="url(#hs-mist)" opacity="0.35" />

        </g>
        {/* a soft flower border in the foreground, slightly out of focus */}
        <g className="pl pl-5 hs-border" filter="url(#hs-haze)">
          <Dabs list={BORDER} />
          {BORDER_FLOWERS.map((f, i) => (
            <circle key={i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} r={f.s.toFixed(1)} fill={f.c} opacity="0.9" />
          ))}
        </g>

        {/* finish: canvas grain and a soft vignette */}
        <rect width={W} height={H} fill="url(#hs-grain-tile)" />
        <rect width={W} height={H} fill="url(#hs-vig)" />
      </svg>

      {/* sunlight, drifting clouds, butterflies — unchanged */}
      <div className="hp-sun" />
      <div className="hp-cloud hp-cloud-1" />
      <div className="hp-cloud hp-cloud-2" />
      <div className="hp-cloud hp-cloud-3" />
      <svg className="hp-birds" viewBox="0 0 900 1350" preserveAspectRatio="xMidYMid slice">
        {[1, 2, 3].map((n) => (
          <g key={n} className={`hp-bfly hp-bfly-${n}`}>
            <g className="hp-wings">
              <path d="M0 0 C-10 -16 -26 -14 -24 -2 C-22 6 -8 6 0 0 Z" fill="#f3ead2" />
              <path d="M0 0 C-8 8 -18 14 -16 4 C-15 0 -6 -1 0 0 Z" fill="#e6d8b4" />
              <path d="M0 0 C10 -16 26 -14 24 -2 C22 6 8 6 0 0 Z" fill="#f3ead2" />
              <path d="M0 0 C8 8 18 14 16 4 C15 0 6 -1 0 0 Z" fill="#e6d8b4" />
            </g>
            <path d="M0 -6 L0 7" stroke="#5a5646" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    </div>
  )
})
