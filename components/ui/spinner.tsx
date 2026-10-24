import { cn } from '@/lib/utils'

// The app's one loading indicator: a rotating square with an accent edge.
const SIZES = {
  xs: 'size-3 border-2',
  sm: 'size-4 border-2',
  md: 'size-6 border-3',
  lg: 'size-8 border-4',
  xl: 'size-12 border-4',
} as const

// Small sizes sit inside buttons and text, so they follow the text colour
// (staying visible on a primary-coloured button); larger ones use the brand
// foreground/primary pairing.
const COLORS: Record<keyof typeof SIZES, string> = {
  xs: 'border-current border-t-transparent',
  sm: 'border-current border-t-transparent',
  md: 'border-foreground border-t-primary',
  lg: 'border-foreground border-t-primary',
  xl: 'border-foreground border-t-primary',
}

interface SpinnerProps extends React.ComponentProps<'span'> {
  size?: keyof typeof SIZES
  /**
   * Announced to screen readers. Omit when the surrounding text already says
   * what is happening (e.g. a "Saving..." button) to keep it decorative.
   */
  label?: string
}

function Spinner({ size = 'md', label, className, ...props }: SpinnerProps) {
  return (
    <span
      {...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true })}
      className={cn('inline-block shrink-0 animate-spin', SIZES[size], COLORS[size], className)}
      {...props}
    />
  )
}

export { Spinner }
