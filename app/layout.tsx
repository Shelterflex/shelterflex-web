import React from "react"
import type { Metadata, Viewport } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NetworkStatusBanner } from '@/components/network-status-banner'
import SkipLink from '@/components/SkipLink'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { InstallPrompt } from '@/components/install-prompt'
import { MobileTabBar } from '@/components/mobile-tab-bar'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { ThemeProvider } from '@/components/theme-provider'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { FeatureFlagProvider } from '@/lib/featureFlags'
import { getServerBackendUrl } from '@/lib/config/env'
import { WalletProvider } from '@/contexts/WalletContext'
import { CookieConsentProvider } from '@/contexts/CookieConsentContext'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from "next-intl"
import enMessages from "../messages/en.json"

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Shelterflex - Rent Now, Pay Later',
  description: 'The smarter way to pay your rent. Split your rent payments into affordable monthly installments.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  applicationName: 'Shelterflex',
  appleWebApp: {
    capable: true,
    title: 'Shelterflex',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
}

// viewport-fit=cover lets the layout extend under the notch; pages pad with the
// safe-area utilities in globals.css. Zoom stays enabled for accessibility.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ff6b35' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: (() => {
              let backend = "";
              try {
                backend = getServerBackendUrl();
              } catch (e) {
                // During build-time prerendering BACKEND_URL may be intentionally
                // unset; avoid throwing to allow static pages to be generated.
                backend = "";
              }
              return `window.__RUNTIME_CONFIG__ = ${JSON.stringify({ BACKEND_URL: backend })};`;
            })(),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale="en" messages={enMessages}>
            <FeatureFlagProvider>
            <CurrencyProvider>
              <WalletProvider>
              <CookieConsentProvider>
              <ErrorBoundary>
                <ServiceWorkerRegister />
                <SpeedInsights />
                <PerformanceMonitor />
                <NetworkStatusBanner />
                <SkipLink />
                <Header />
                <div id="main-content" />
                {children}
                <Footer />
                <MobileTabBar />
                <PullToRefresh />
                <Toaster />
                <CookieConsentBanner />
                <InstallPrompt />
              </ErrorBoundary>
              </CookieConsentProvider>
              </WalletProvider>
            </CurrencyProvider>
            </FeatureFlagProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
