"use client"

import { SlidersHorizontal } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LanguageSwitcher } from "@/components/language-switcher"
import { CurrencyToggle } from "@/components/currency-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import BackendHealthCompact from "@/components/BackendHealthCompact"

/**
 * Groups the header's low-frequency controls (language, currency, theme,
 * backend health) behind a single button. They stay reachable, but stop
 * competing with navigation and the primary actions for horizontal space.
 */
export function HeaderUtilitiesMenu() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Display settings"
        className="flex min-h-11 items-center justify-center border-3 border-foreground bg-background px-3 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-64 border-3 border-foreground bg-background p-0 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]"
      >
        <p className="border-b-3 border-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide">
          Display
        </p>

        <div className="divide-y-2 divide-foreground/15">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-medium">Language</span>
            <LanguageSwitcher />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-medium">Currency</span>
            <CurrencyToggle />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-medium">Backend</span>
            <BackendHealthCompact />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
