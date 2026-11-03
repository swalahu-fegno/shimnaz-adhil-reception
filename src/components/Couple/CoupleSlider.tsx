import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from '../ui/MughalIcons'
import { bride, couplePhotoAspect, couplePhotos, groom } from '../../data/wedding'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../utils/cn'
import { SmartImage } from '../ui/SmartImage'
import { archPath } from '../ui/Ornaments'

const ARCH_W = 400
const ARCH_H = 480
const EASE = [0.22, 1, 0.36, 1] as const

/** Past either of these and the swipe counts, however slow or short it was. */
const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 400

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0, scale: 0.94 }),
  center: { x: '0%', opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0, scale: 0.94 }),
}

const COUPLE_LABEL = `${groom.firstName} and ${bride.firstName}`

/**
 * A slider of the couple together.
 *
 * The bride and groom are deliberately NOT one slide each — these are photos of
 * the two of them, so splitting them across slides would recreate the very
 * separation this replaced. One frame, one couple; the names sit beneath it as
 * a single block.
 *
 * Photos are clipped to a mihrab arch — the one gesture that makes this read as
 * Islamic architecture rather than a generic gallery.
 *
 * Drivable four ways, because a carousel that only answers to arrows is one
 * most people never advance: swipe, arrows, dots, and the keyboard.
 */
export function CoupleSlider() {
  const prefersReduced = useReducedMotion()
  const [[index, direction], setPage] = useState<[number, number]>([0, 0])

  const count = couplePhotos.length

  const paginate = useCallback(
    (dir: number) => setPage(([i]) => [(i + dir + count) % count, dir]),
    [count],
  )

  const goTo = useCallback((next: number) => setPage(([i]) => [next, next > i ? 1 : -1]), [])

  const onDragEnd = useCallback(
    (_e: unknown, { offset, velocity }: PanInfo) => {
      const power = Math.abs(offset.x) * 0.6 + Math.abs(velocity.x) * 0.2
      if (power < SWIPE_DISTANCE && Math.abs(velocity.x) < SWIPE_VELOCITY) return
      paginate(offset.x < 0 ? 1 : -1)
    },
    [paginate],
  )

  // Arrow keys, once the slider has focus
  useEffect(() => {
    const el = document.getElementById('couple-slider')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paginate(-1)
      else if (e.key === 'ArrowRight') paginate(1)
    }
    el?.addEventListener('keydown', onKey)
    return () => el?.removeEventListener('keydown', onKey)
  }, [paginate])

  const photo = couplePhotos[index]
  const single = count < 2

  return (
    <div
      id="couple-slider"
      tabIndex={-1}
      role="group"
      aria-roledescription="carousel"
      aria-label={`Photos of ${COUPLE_LABEL}`}
      className="relative mx-auto w-full max-w-2xl focus:outline-none"
    >
      <div className="flex items-center justify-center gap-3 sm:gap-6">
        {/* Arrows are hidden on phones: they'd collide with the floating dock,
            and swipe is the native gesture there anyway. */}
        {!single && <NavButton dir="prev" onClick={() => paginate(-1)} />}

        <div className="relative flex-1 overflow-hidden">
          {/* The frame's height comes from the aspect ratio, so it never jolts
              between slides even though each photo differs. */}
          <div className="relative mx-auto w-full max-w-[22rem]">
            <ArchOutline />

            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: couplePhotoAspect,
                clipPath: 'url(#couple-arch-clip)',
              }}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={photo.src}
                  custom={direction}
                  variants={prefersReduced ? undefined : variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { duration: 0.7, ease: EASE },
                    opacity: { duration: 0.45 },
                    scale: { duration: 0.7, ease: EASE },
                  }}
                  drag={prefersReduced || single ? false : 'x'}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={onDragEnd}
                  className={cn('absolute inset-0', !single && 'cursor-grab active:cursor-grabbing')}
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${count}`}
                >
                  <SmartImage
                    src={photo.src}
                    alt={photo.caption ? `${COUPLE_LABEL} — ${photo.caption}` : COUPLE_LABEL}
                    className="h-full w-full"
                    /* Photos are dragged, so the browser's native image-drag
                       must not fight the swipe. */
                    imgClassName="pointer-events-none select-none"
                    fallbackHint={`Add ${photo.src.split('/').pop()}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Warm grade so every photo sits in the same light */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-deep/40 via-transparent to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-gold/[0.06] mix-blend-overlay" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {!single && <NavButton dir="next" onClick={() => paginate(1)} />}
      </div>

      {/* Announce the change — the visual swap is silent to a screen reader */}
      <p aria-live="polite" className="sr-only">
        Photo {index + 1} of {count}
        {photo.caption ? `: ${photo.caption}` : ''}
      </p>

      {photo.caption && (
        <p className="mt-6 text-center text-[0.7rem] font-light tracking-[0.14em] text-muted italic">
          {photo.caption}
        </p>
      )}

      {/* Dots */}
      {!single && (
        <>
          <div className="mt-8 flex items-center justify-center gap-3">
            {couplePhotos.map((p, i) => {
              const active = i === index
              return (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={active}
                  className="group relative flex h-8 items-center px-1"
                >
                  <span
                    className={cn(
                      'block h-px transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      active ? 'w-12 bg-gold' : 'w-6 bg-gold/30 group-hover:bg-gold/60',
                    )}
                  />
                </button>
              )
            })}
          </div>

          <p className="text-center text-[0.55rem] font-light tracking-[0.28em] text-muted/50 uppercase sm:hidden">
            Swipe
          </p>
        </>
      )}
    </div>
  )
}

/** The offset gold arch that lifts off the photo, plus the clip path itself. */
function ArchOutline() {
  return (
    <>
      <svg
        viewBox={`0 0 ${ARCH_W} ${ARCH_H}`}
        className="pointer-events-none absolute -inset-x-3 -top-3 bottom-3 h-full w-[calc(100%+1.5rem)] text-gold/40"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={archPath(ARCH_W, ARCH_H)}
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          {/* Unit box (0–1) so one clip serves whatever size the arch renders at */}
          <clipPath id="couple-arch-clip" clipPathUnits="objectBoundingBox">
            <path d={archPath(1, 1)} />
          </clipPath>
        </defs>
      </svg>
    </>
  )
}

function NavButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      aria-label={dir === 'prev' ? 'Previous photo' : 'Next photo'}
      className="relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold-deep transition-colors duration-500 hover:border-gold hover:bg-gold/[0.07] sm:flex"
    >
      <Icon className="h-4 w-4" strokeWidth={1.25} />
    </motion.button>
  )
}

/**
 * Both names, one block — the couple presented together rather than as two
 * facing columns with a divider down the middle.
 *
 * Sits above the slider, so the names introduce the photos rather than caption
 * them. Vertical spacing is the caller's business, not this component's.
 */
export function CoupleNames() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* The two families, side by side but under one heading — related, not split */}
      <dl className="grid gap-7 sm:grid-cols-2 sm:gap-12">
        {[groom, bride].map((person) => (
          <div key={person.initial} className="flex flex-col items-center">
            <dt className="flex flex-col items-center">
              {/* The name, given weight: larger, emerald, and underlined with a
                  gold rule — so it reads as the subject of the block rather
                  than a caption sitting among the parents' names. */}
              <span className="display relative text-[clamp(1.35rem,3vw,1.75rem)] leading-tight text-emerald">
                {person.fullName}
                <span
                  className="absolute -bottom-2 left-1/2 h-px w-full max-w-[7rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent"
                  aria-hidden="true"
                />
              </span>

              {/*
                No `text-base` here: Tailwind's text-* utilities set line-height
                too, and 1.5rem clips the harakat and descenders off Arabic
                script. Explicit leading keeps the whole glyph.
              */}
              {person.arabicName && (
                <span
                  className="arabic mt-6 block text-[1.15rem] leading-[2.1] text-gold-deep/85"
                  lang="ar"
                >
                  {person.arabicName}
                </span>
              )}
            </dt>

            <dd className="mt-3 text-[0.74rem] leading-relaxed font-light text-muted">
              <span className="mb-1 block text-[0.52rem] tracking-[0.28em] text-gold-deep uppercase">
                Beloved child of
              </span>
              {person.father}
              <span className="mx-1.5 text-gold">&amp;</span>
              {person.mother}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
