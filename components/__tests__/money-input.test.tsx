import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MoneyInput, groupThousands, parseAmount } from '@/components/ui/money-input'

describe('groupThousands / parseAmount', () => {
  it('groups thousands and keeps decimals', () => {
    expect(groupThousands('1500000')).toBe('1,500,000')
    expect(groupThousands('1500000.5')).toBe('1,500,000.5')
    expect(groupThousands('12.')).toBe('12.')
    expect(groupThousands('')).toBe('')
  })

  it('strips separators, junk and extra decimals', () => {
    expect(parseAmount('1,500,000', 0)).toBe('1500000')
    expect(parseAmount('₦1,500.759', 2)).toBe('1500.75')
    expect(parseAmount('1.2.3', 2)).toBe('1.23')
    expect(parseAmount('1500.5', 0)).toBe('1500')
    expect(parseAmount('007', 0)).toBe('7')
  })
})

describe('MoneyInput', () => {
  function Harness({ onRaw }: { onRaw: (v: string) => void }) {
    const [value, setValue] = useState('')
    return (
      <MoneyInput
        aria-label="Amount"
        name="annualRent"
        decimals={0}
        value={value}
        onChange={(e) => {
          onRaw(`${e.target.name}=${e.target.value}`)
          setValue(e.target.value)
        }}
      />
    )
  }

  it('shows grouped digits but hands the raw number and name to onChange', () => {
    const onRaw = vi.fn()
    render(<Harness onRaw={onRaw} />)
    const input = screen.getByLabelText('Amount') as HTMLInputElement

    fireEvent.change(input, { target: { value: '2500000' } })

    expect(onRaw).toHaveBeenLastCalledWith('annualRent=2500000')
    expect(input.value).toBe('2,500,000')
    expect(input.type).toBe('text')
    expect(input.inputMode).toBe('numeric')
  })
})
