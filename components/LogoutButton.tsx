'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-winzee-muted hover:text-red-500 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
    >
      Logout
    </button>
  )
}
