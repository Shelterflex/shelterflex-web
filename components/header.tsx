"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"
import BackendHealthCompact from "@/components/BackendHealthCompact"
import { MobileMenu } from "@/components/ui/mobile-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { CurrencyToggle } from "@/components/currency-toggle"
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton"
import { LanguageSwitcher } from "@/components/language-switcher"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { GlobalSearch } from "@/components/GlobalSearch"

const navLinks = [
  { href: "/properties", label: "Find a Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/landlords", label: "For Landlords" },
  { href: "/about", label: "About" },
]

export function Header() {
  const pathname = usePathname()
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setGlobalSearchOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const isAuthPage = pathname === "/login" || pathname === "/signup"
  const isDashboard = pathname.startsWith("/dashboard")

  if (isAuthPage || isDashboard) return null

  return (
    <header className="sticky top-0 z-50 bg-background border-b-4 border-foreground">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-3 border-foreground bg-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <Home className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            </div>
            <span className="whitespace-nowrap font-mono text-lg sm:text-xl font-black tracking-tight">
              SHELTER<span className="text-primary">FLEX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap font-medium transition-colors hover:text-primary text-sm xl:text-base ${
                  pathname === link.href ? "text-primary" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search Trigger */}
          <div className="hidden lg:flex">
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="flex items-center gap-2 border-3 border-foreground px-3 py-1.5 font-bold shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all bg-background text-foreground min-h-[44px] text-sm"
              aria-label="Open global search"
            >
              <Search className="h-4 w-4" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="ml-1 hidden xl:inline-flex items-center gap-0.5 rounded-sm border border-foreground/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                <span className="text-[9px]">&#8984;</span>K
              </kbd>
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <div className="hidden xl:flex items-center gap-2 xl:gap-3">
              <LanguageSwitcher />
              <CurrencyToggle />
            </div>
            <ThemeToggle />
            <NotificationBell />
            <ConnectWalletButton />
            <div className="hidden xl:block">
              <BackendHealthCompact />
            </div>
            <Link
              href="/login"
              className="whitespace-nowrap px-2 text-sm font-bold hover:text-primary transition-colors"
            >
              Log In
            </Link>
            <Link href="/signup">
              <Button className="whitespace-nowrap border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 rtl:hover:-translate-x-0.5 hover:translate-y-0.5 transition-all text-foreground min-h-11 px-4 xl:px-6">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <MobileMenu navLinks={navLinks} pathname={pathname} />
        </div>
      </div>
      <GlobalSearch open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
    </header>
  )
}
