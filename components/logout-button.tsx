"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import useAuthStore from "@/store/useAuthStore"

interface LogoutButtonProps {
  className?: string
  /** Runs before the session is cleared, e.g. to close a menu. */
  onLogout?: () => void
}

/** Ends the session and returns to the homepage. */
export function LogoutButton({ className, onLogout }: Readonly<LogoutButtonProps>) {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  function handleClick() {
    onLogout?.()
    logout()
    router.replace("/")
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      <LogOut className="h-5 w-5" />
      Log out
    </button>
  )
}
