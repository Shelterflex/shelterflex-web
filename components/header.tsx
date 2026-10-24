"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"
import { MobileMenu } from "@/components/ui/mobile-menu"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { GlobalSearch } from "@/components/GlobalSearch"
import { HeaderUtilitiesMenu } from "@/components/header-utilities-menu"

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
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      {/* The bar is its own card strip, inset from the page edges rather than
          a full-bleed band, so page content scrolls visibly around it. */}
      <div className="container mx-auto border-3 border-foreground bg-background px-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] sm:px-6">
        <div className="flex h-16 items-center gap-4 xl:gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <Home className="h-5 w-5 text-foreground" />
            </div>
            <span className="whitespace-nowrap font-mono text-lg font-black tracking-tight">
              SHELTER<span className="text-primary">FLEX</span>
            </span>
          </Link>

          {/* Navigation takes the slack between the brand and the actions. */}
          <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`whitespace-nowrap border-3 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "border-foreground bg-primary text-foreground"
                      : "border-transparent text-foreground/80 hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions sit flush right; utilities collapse into one button. */}
          <div className="hidden shrink-0 items-center gap-2 lg:ml-auto lg:flex">
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="flex min-h-11 items-center gap-2 border-3 border-foreground bg-background px-3 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]"
              aria-label="Open global search"
            >
              <Search className="h-4 w-4" />
              <kbd className="hidden items-center gap-0.5 border border-foreground/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground xl:inline-flex">
                <span className="text-[9px]">&#8984;</span>K
              </kbd>
            </button>

            <NotificationBell />
            <HeaderUtilitiesMenu />

            {/* Log in and wallet connection both live behind Get Started. */}
            <Link href="/signup">
              <Button className="whitespace-nowrap border-3 border-foreground bg-primary px-4 font-bold text-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 rtl:hover:-translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] min-h-11">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="ml-auto lg:hidden">
            <MobileMenu navLinks={navLinks} pathname={pathname} />
          </div>
        </div>
      </div>
      <GlobalSearch open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
    </header>
  )
}
