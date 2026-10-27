"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Home, Mail, Phone, MapPin, ChevronDown } from "lucide-react"
import { useCookieConsentContext } from "@/contexts/CookieConsentContext"

const footerLinks = {
  product: [
    { label: "Find a Home", href: "/properties" },
    { label: "Calculator", href: "/calculator" },
    { label: "For Landlords", href: "/landlords" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
}

// On phones each link group collapses behind a tap so the footer is a few rows
// tall instead of two screens; from md up the groups are always open.
function FooterColumn({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-background/20 md:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 font-mono text-lg font-bold text-primary md:pointer-events-none md:mb-6 md:py-0"
      >
        {title}
        <ChevronDown className={`h-5 w-5 transition-transform md:hidden ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`${open ? "block pb-4" : "hidden"} md:block md:pb-0`}>{children}</div>
    </div>
  )
}

export function Footer() {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/signup"
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/whistleblower/dashboard")
  const { openPreferences } = useCookieConsentContext()

  if (isAuthPage || isDashboard) return null

  return (
    <footer className="bg-foreground text-background py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="flex h-10 w-10 items-center justify-center border-3 border-background bg-primary shadow-[4px_4px_0px_0px_rgba(255,254,249,0.3)]">
                <Home className="h-5 w-5 text-foreground" />
              </div>
              <span className="font-mono text-xl font-black tracking-tight">
                SHELTERFLEX
              </span>
            </Link>
            <p className="hidden text-background/70 mb-6 max-w-sm leading-relaxed md:block">
              The smarter way to pay your rent. Split your annual rent into
              affordable monthly payments and move into your dream home today.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:hello@shelterflex.com"
                className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>hello@shelterflex.com</span>
              </a>
              <a
                href="tel:+2341234567890"
                className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>+234 123 456 7890</span>
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="h-5 w-5" />
                <span>Lagos | Abuja | Port Harcourt</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <FooterColumn title="Product">
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          {/* Company Links */}
          <FooterColumn title="Company">
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          {/* Legal Links */}
          <FooterColumn title="Legal">
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={openPreferences}
                  className="text-background/70 hover:text-background transition-colors text-left"
                  aria-label="Open cookie preference settings"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </FooterColumn>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-background/20 pt-6 md:mt-16 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2026 Shelterflex. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-background/60 text-sm">Follow us</span>
              <div className="flex gap-2">
                {["X", "IG", "LI"].map((platform, i) => (
                  <div
                    key={platform}
                    className="h-8 w-8 border-2 border-background/40 flex items-center justify-center font-mono font-bold text-xs cursor-pointer hover:bg-primary hover:border-primary transition-colors"
                  >
                    <span className="text-background">{platform}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
