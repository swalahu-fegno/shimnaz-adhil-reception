import type { SVGProps } from 'react'

/** A rococo-style corner scroll, drawn for the top-left corner. Flip with CSS. */
export function CornerScroll(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M4 116V40C4 20 20 4 40 4h76" strokeWidth="1.2" />
      <path d="M12 116V44c0-18 14-32 32-32h72" strokeWidth="0.6" opacity="0.7" />
      <path d="M40 4c-6 10-2 22 8 24 9 2 14-6 10-12-3-5-10-4-11 1" strokeWidth="1.1" />
      <path d="M4 40c10-6 22-2 24 8 2 9-6 14-12 10-5-3-4-10 1-11" strokeWidth="1.1" />
      <path d="M26 26c8 4 14 2 18-4M26 26c4 8 2 14-4 18" strokeWidth="0.9" />
      <path d="M28 28c10 10 22 12 34 8" strokeWidth="0.8" opacity="0.8" />
      <path d="M28 28c10 10 12 22 8 34" strokeWidth="0.8" opacity="0.8" />
      <path d="M62 36c6-6 14-6 18 0-6 4-12 4-18 0Z" strokeWidth="0.8" />
      <path d="M36 62c-6 6-6 14 0 18 4-6 4-12 0-18Z" strokeWidth="0.8" />
      <circle cx="26" cy="26" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** A thin painted frame with scrolled corners, sized to its parent. */
export function OrnateFrame({ className = '' }: { className?: string }) {
  const corner = 'absolute h-16 w-16 md:h-24 md:w-24'
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <div className="absolute inset-[7px] border border-current opacity-40 md:inset-[10px]" />
      <div className="absolute inset-0 border border-current opacity-70" />
      <CornerScroll className={`${corner} -top-[3px] -left-[3px]`} />
      <CornerScroll className={`${corner} -top-[3px] -right-[3px] -scale-x-100`} />
      <CornerScroll className={`${corner} -bottom-[3px] -left-[3px] -scale-y-100`} />
      <CornerScroll className={`${corner} -right-[3px] -bottom-[3px] -scale-100`} />
    </div>
  )
}

/** A short divider: two hairlines and a leaf sprig. */
export function Sprig({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-current opacity-40 md:w-20" />
      <svg viewBox="0 0 48 16" className="h-4 w-12" fill="none" stroke="currentColor" strokeWidth="0.9">
        <path d="M2 8h44" opacity="0.6" />
        <path d="M24 8c-4-6-10-7-14-5 3 4 9 6 14 5Zm0 0c4-6 10-7 14-5-3 4-9 6-14 5Z" />
        <path d="M24 8c-3 4-8 5-11 4 2-3 7-4 11-4Zm0 0c3 4 8 5 11 4-2-3-7-4-11-4Z" opacity="0.7" />
        <circle cx="24" cy="8" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      <span className="h-px w-12 bg-current opacity-40 md:w-20" />
    </div>
  )
}

/** A trailing olive branch, for section corners. */
export function OliveBranch(props: SVGProps<SVGSVGElement>) {
  const leaves = [
    [30, 70, -30],
    [48, 58, 25],
    [62, 48, -35],
    [80, 38, 20],
    [94, 30, -40],
    [112, 22, 15],
    [126, 16, -30],
  ]
  return (
    <svg viewBox="0 0 160 100" fill="none" stroke="currentColor" aria-hidden="true" {...props}>
      <path d="M4 92C40 70 90 36 150 10" strokeWidth="1" strokeLinecap="round" />
      {leaves.map(([x, y, r], i) => (
        <path
          key={i}
          d={`M${x} ${y}c6-10 16-14 24-12-4 9-14 14-24 12Z`}
          transform={`rotate(${r} ${x} ${y})`}
          strokeWidth="0.8"
          fill="currentColor"
          fillOpacity="0.12"
        />
      ))}
      <circle cx="56" cy="62" r="3" fill="currentColor" fillOpacity="0.35" stroke="none" />
      <circle cx="104" cy="34" r="2.6" fill="currentColor" fillOpacity="0.35" stroke="none" />
    </svg>
  )
}
