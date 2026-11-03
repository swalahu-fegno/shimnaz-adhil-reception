import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'gold' | 'glass' | 'outline' | 'emerald'
type Size = 'sm' | 'md' | 'lg'

interface BaseProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const SIZES: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-[0.62rem] tracking-[0.22em]',
  md: 'px-8 py-3.5 text-[0.66rem] tracking-[0.26em]',
  lg: 'px-11 py-5 text-[0.72rem] tracking-[0.34em]',
}

const VARIANTS: Record<Variant, string> = {
  gold: 'bg-gold text-white border border-gold hover:bg-gold-deep hover:border-gold-deep',
  // Charcoal with gold type and a gold rule — the Hero's ground, as a button.
  emerald:
    'bg-[radial-gradient(ellipse_at_center,#3a3a3c,#232325)] text-gold-soft border border-gold/70 shadow-[inset_0_0_0_3px_#232325,inset_0_0_0_4px_rgba(209,180,122,0.35)] hover:text-gold hover:border-gold',
  glass: 'glass text-ink hover:border-gold/60 hover:bg-white/80',
  outline: 'border border-gold/45 text-ink bg-transparent hover:border-gold hover:bg-gold/[0.06]',
}

/**
 * Shared button shell.
 *
 * The hover signature is a diagonal specular sweep — a translucent band that
 * travels across the face in 700ms. It's the same gesture as the `.foil` text
 * treatment, so buttons and gold type feel like the same material.
 */
function shell(variant: Variant, size: Size, fullWidth?: boolean, className?: string) {
  return cn(
    'group relative inline-flex items-center justify-center gap-3 overflow-hidden',
    'rounded-[1px] font-body font-light uppercase',
    'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    SIZES[size],
    VARIANTS[variant],
    fullWidth && 'w-full',
    className,
  )
}

function Sweep() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
    />
  )
}

function Inner({
  children,
  icon,
  iconPosition,
}: Pick<BaseProps, 'children' | 'icon' | 'iconPosition'>) {
  return (
    <>
      <Sweep />
      {icon && iconPosition === 'left' && (
        <span className="relative transition-transform duration-500 group-hover:-translate-x-0.5">
          {icon}
        </span>
      )}
      <span className="relative">{children}</span>
      {icon && iconPosition !== 'left' && (
        <span className="relative transition-transform duration-500 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  )
}

type ButtonProps = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  variant = 'gold',
  size = 'md',
  className,
  icon,
  iconPosition = 'right',
  fullWidth,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0, scale: 0.985 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={shell(variant, size, fullWidth, className)}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      <Inner icon={icon} iconPosition={iconPosition}>
        {children}
      </Inner>
    </motion.button>
  )
}

type LinkProps = BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement>

export function ButtonLink({
  children,
  variant = 'gold',
  size = 'md',
  className,
  icon,
  iconPosition = 'right',
  fullWidth,
  ...rest
}: LinkProps) {
  return (
    <motion.a
      whileHover={{ y: -2 }}
      whileTap={{ y: 0, scale: 0.985 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={shell(variant, size, fullWidth, className)}
      {...(rest as React.ComponentProps<typeof motion.a>)}
    >
      <Inner icon={icon} iconPosition={iconPosition}>
        {children}
      </Inner>
    </motion.a>
  )
}
