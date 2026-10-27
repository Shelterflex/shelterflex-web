"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Calculator, User } from "lucide-react"
import { locales } from "@/i18n"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useHomeDashboard } from "@/hooks/useHomeDashboard"
import { useMounted } from "@/hooks/use-mounted"
import { tapHaptic } from "@/lib/haptics"

const LOCALE_PREFIX = new RegExp(`^/(${locales.join("|")})(?=/|$)`)

// Thumb-reach navigation for public pages on phones. Dashboards have their own
// bar (DashboardSidebar), and auth screens stay distraction-free.
export function MobileTabBar() {
  const pathname = usePathname().replace(LOCALE_PREFIX, "") || "/"
  const { isAuthenticated } = useCurrentUser()
  const homeDashboard = useHomeDashboard()
  const signedIn = useMounted() && isAuthenticated

  const hidden =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/whistleblower/dashboard")
  if (hidden) return null

  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Homes", icon: Search },
    { href: "/calculator", label: "Calculate", icon: Calculator },
    signedIn
      ? { href: homeDashboard, label: "Me", icon: User }
      : { href: "/signup", label: "Join", icon: User },
  ]

  return (
    <nav
      data-bottom-nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t-3 border-foreground bg-card pb-safe lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <li key={label}>
              <Link
                href={href}
                onClick={tapHaptic}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 font-mono text-[11px] font-bold uppercase ${
                  active ? "bg-primary text-foreground" : "text-foreground/70"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
