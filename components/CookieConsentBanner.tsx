'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCookieConsentContext } from '@/contexts/CookieConsentContext'
import { CookiePreferenceModal } from '@/components/CookiePreferenceModal'

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectNonEssential, openPreferences, isLoaded } =
    useCookieConsentContext()

  if (!isLoaded || !showBanner) {
    return <CookiePreferenceModal />
  }

  return (
    <>
      <div
        role="region"
        aria-label="Cookie consent"
        className="fixed bottom-0 left-0 z-50 w-full pb-safe border-t-3 border-foreground bg-foreground text-background shadow-[0_-4px_0px_0px_rgba(26,26,26,1)] dark:bg-card dark:text-foreground"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-background/90 dark:text-foreground/90">
            We use cookies to improve your experience. See our{' '}
            <Link
              href="/cookies"
              className="font-bold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Cookie Policy
            </Link>
            .
          </p>

          {/* dense flow lets Accept sit beside Reject while Manage takes its own row */}
          <div className="grid shrink-0 grid-flow-dense grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button
              onClick={rejectNonEssential}
              aria-label="Reject non-essential cookies"
              className="border-2 border-background bg-transparent text-background font-bold hover:bg-background/10 transition-colors dark:border-foreground dark:text-foreground dark:hover:bg-foreground/10"
            >
              Reject Non-Essential
            </Button>
            <Button
              onClick={openPreferences}
              aria-label="Manage cookie preferences"
              className="col-span-2 sm:col-span-1 border-2 border-background bg-transparent text-background font-bold hover:bg-background/10 transition-colors dark:border-foreground dark:text-foreground dark:hover:bg-foreground/10"
            >
              Manage Preferences
            </Button>
            <Button
              onClick={acceptAll}
              aria-label="Accept all cookies"
              className="border-3 border-background bg-primary font-bold text-foreground dark:border-foreground dark:text-primary-foreground shadow-[4px_4px_0px_0px_rgba(255,254,249,0.4)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(255,254,249,0.4)]"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <CookiePreferenceModal />
    </>
  )
}
