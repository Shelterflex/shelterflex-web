'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'

/** "1500000.5" -> "1,500,000.5"; keeps a trailing "." while the user types. */
export function groupThousands(raw: string): string {
  if (!raw) return ''
  const [int, dec] = raw.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec === undefined ? grouped : `${grouped}.${dec}`
}

/** Strips separators and anything else that isn't a digit or the first ".". */
export function parseAmount(display: string, decimals: number): string {
  let cleaned = display.replace(/[^\d.]/g, '')
  const dot = cleaned.indexOf('.')
  if (dot !== -1) {
    if (decimals === 0) {
      cleaned = cleaned.slice(0, dot)
    } else {
      cleaned = cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, '').slice(0, decimals)
    }
  }
  return cleaned.replace(/^0+(?=\d)/, '')
}

type MoneyInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
  value: string | number | undefined | null
  /**
   * Called like a normal input onChange, but `event.target.value` is the raw
   * number string ("1500000"), so existing handlers keep working unchanged.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Digits allowed after the decimal point; 0 for whole naira. */
  decimals?: number
}

/**
 * Amount field for phones: opens the numeric keypad (type="number" shows a
 * clumsy keyboard on iOS and changes value on scroll), and groups thousands
 * as you type so ₦1,500,000 is readable at a glance.
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { value, onChange, decimals = 2, ...props },
  forwardedRef,
) {
  const innerRef = React.useRef<HTMLInputElement>(null)
  React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLInputElement)
  const pendingCaret = React.useRef<number | null>(null)

  const display = groupThousands(value === undefined || value === null ? '' : String(value))

  // Put the caret back after the same number of digits it followed before the
  // separators moved, instead of letting it jump to the end.
  React.useLayoutEffect(() => {
    const el = innerRef.current
    const digitsBefore = pendingCaret.current
    if (!el || digitsBefore === null || document.activeElement !== el) return
    pendingCaret.current = null
    let pos = 0
    let seen = 0
    while (pos < el.value.length && seen < digitsBefore) {
      if (/[\d.]/.test(el.value[pos])) seen++
      pos++
    }
    el.setSelectionRange(pos, pos)
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const caret = e.target.selectionStart ?? e.target.value.length
    pendingCaret.current = e.target.value.slice(0, caret).replace(/[^\d.]/g, '').length
    const raw = parseAmount(e.target.value, decimals)
    onChange?.({
      ...e,
      target: { ...e.target, name: e.target.name, id: e.target.id, value: raw },
      currentTarget: { ...e.currentTarget, name: e.currentTarget.name, id: e.currentTarget.id, value: raw },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <Input
      {...props}
      ref={innerRef}
      type="text"
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      autoComplete={props.autoComplete ?? 'off'}
      value={display}
      onChange={handleChange}
    />
  )
})
