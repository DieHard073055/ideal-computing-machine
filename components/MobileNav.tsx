'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MobileNavProps {
  session: { isAdmin?: boolean } | null
}

export function MobileNav({ session }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl text-winzee-muted hover:text-winzee-indigo hover:bg-winzee-bg transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-card z-50 px-4 py-4 flex flex-col gap-2">
          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-winzee-indigo font-medium hover:bg-winzee-bg transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/events"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-winzee-indigo font-medium hover:bg-winzee-bg transition-colors"
              >
                Browse Events
              </Link>
              {session.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-winzee-indigo font-medium hover:bg-winzee-bg transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl text-red-500 font-medium hover:bg-red-50 transition-colors text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-winzee-indigo font-medium hover:bg-winzee-bg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-pill bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white font-semibold text-center shadow-winzee"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
