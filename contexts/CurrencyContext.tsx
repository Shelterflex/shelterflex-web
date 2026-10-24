'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocale } from 'next-intl'
import usePreferencesStore from '@/store/usePreferencesStore'
import { formatByPreference, formatDual, type DisplayCurrency } from '@/lib/currency'
import useAuthStore from '@/store/useAuthStore'
import { apiPatch } from '@/lib/apiClient'
import { getCurrentUser } from '@/lib/authApi'

interface CurrencyContextValue {
  displayCurrency: DisplayCurrency
  setDisplayCurrency: (currency: DisplayCurrency) => Promise<void>
  formatAmount: (amountNgn: number | string, amountUsdc: number | string) => string
  formatDual: (amountNgn: number | string, amountUsdc: number | string) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const currency = usePreferencesStore((s) => s.currency) as DisplayCurrency
  const setPreference = usePreferencesStore((s) => s.setPreference)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [, setTick] = useState(0)

  const setDisplayCurrency = useCallback(
    async (next: DisplayCurrency) => {
      setPreference('currency', next)
      setTick((t) => t + 1)
      if (!isAuthenticated) return
      try {
        await apiPatch('/user/preferences', { displayCurrency: next })
      } catch {
        // Local preference still applies when offline
      }
    },
    [setPreference, isAuthenticated],
  )

  // Signed-in users carry their preference across devices.
  useEffect(() => {
    if (!isAuthenticated) return
    getCurrentUser()
      .then(({ user }) => {
        const dc = user.displayCurrency
        if (dc === 'NGN' || dc === 'USDC') {
          setPreference('currency', dc)
          setTick((t) => t + 1)
        }
      })
      .catch(() => undefined)
  }, [isAuthenticated, setPreference])

  const value = useMemo<CurrencyContextValue>(
    () => ({
      displayCurrency: currency === 'USDC' ? 'USDC' : 'NGN',
      setDisplayCurrency,
      formatAmount: (ngn, usdc) => formatByPreference(ngn, usdc, currency === 'USDC' ? 'USDC' : 'NGN', locale),
      formatDual: (ngn, usdc) => formatDual(ngn, usdc, locale),
    }),
    [currency, locale, setDisplayCurrency],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return ctx
}
