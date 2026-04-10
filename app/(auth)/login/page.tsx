'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }

      if (data.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-winzee-bg px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-winzee-purple to-winzee-purple2 flex items-center justify-center shadow-winzee">
              <svg className="w-9 h-9 text-winzee-lime" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-winzee-dark">Winzee</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-winzee-indigo mt-5">Welcome back</h1>
          <p className="text-winzee-muted mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-1" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-winzee-muted text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-winzee-purple hover:text-winzee-purple2 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
