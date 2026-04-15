import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { LogoutButton } from '@/components/LogoutButton'
import { MobileNav } from '@/components/MobileNav'

export const metadata: Metadata = {
  title: 'Winzee — The Maldives\' First On-Chain Lucky Draw',
  description: 'Proudly Maldivian. Buy lucky draw tickets with USDC on Base, Arbitrum, BNB Chain, and Polygon.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="en">
      <body className="bg-white text-winzee-indigo min-h-screen antialiased">
        <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-winzee-purple to-winzee-purple2 flex items-center justify-center shadow-winzee">
                  <svg className="w-5 h-5 text-winzee-lime" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <span className="font-display font-bold text-xl text-winzee-dark">Winzee</span>
                <span className="text-lg leading-none" title="Proudly Maldivian">🇲🇻</span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden sm:flex items-center gap-3">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-winzee-muted hover:text-winzee-indigo text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-winzee-bg"
                    >
                      Dashboard
                    </Link>
                    {session.isAdmin && (
                      <Link
                        href="/admin"
                        className="text-winzee-muted hover:text-winzee-indigo text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-winzee-bg"
                      >
                        Admin
                      </Link>
                    )}
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-winzee-muted hover:text-winzee-indigo text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-winzee-bg"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-gradient-to-r from-winzee-purple to-winzee-purple2 hover:shadow-winzee text-white px-5 py-2 rounded-pill text-sm font-semibold transition-all active:scale-[0.98]"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <MobileNav session={session} />
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="bg-winzee-dark text-white/60 py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 font-display font-semibold text-white">
              <span>🇲🇻</span>
              <span>Winzee</span>
            </div>
            <p className="text-center">
              Made with <span className="text-red-400">♥</span> in the Maldives &nbsp;·&nbsp; © {new Date().getFullYear()} Winzee. All rights reserved.
            </p>
            <p className="font-display text-winzee-teal text-xs tracking-wide" dir="rtl" lang="dv">
              ނަސީބު ތިޔަ ލިބޭނެ
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
