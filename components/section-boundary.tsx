'use client'

import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface SectionBoundaryProps {
  children: ReactNode
  /** Identifies which page section failed, for the caller's own reference. */
  section: string
  userRole: 'tenant' | 'landlord' | 'guest'
}

/**
 * Isolates one page section behind its own error boundary so a crash there
 * (e.g. a bad image URL, a malformed API field) can't take down the whole
 * page — it degrades to that section's own fallback instead.
 *
 * `section`/`userRole` are accepted for call-site parity with other section
 * boundaries but aren't forwarded anywhere: this app's ErrorBoundary only
 * takes `level`.
 */
export function SectionBoundary({ children }: SectionBoundaryProps) {
  return <ErrorBoundary level="section">{children}</ErrorBoundary>
}
