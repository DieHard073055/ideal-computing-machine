'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface AdminEventActionsProps {
  eventId: string
  status: string
  hasWinner: boolean
}

export function AdminEventActions({ eventId, status, hasWinner }: AdminEventActionsProps) {
  const router = useRouter()
  const [closing, setClosing] = useState(false)
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState('')

  const closeEvent = async () => {
    if (!confirm('Are you sure you want to close this event? No more tickets can be purchased.')) return
    setClosing(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to close event')
        return
      }
      router.refresh()
    } catch {
      setError('Failed to close event.')
    } finally {
      setClosing(false)
    }
  }

  const pickWinner = async () => {
    if (!confirm('Pick a random winner from all confirmed tickets? This cannot be undone.')) return
    setPicking(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/events/${eventId}/winner`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to pick winner')
        return
      }
      router.refresh()
    } catch {
      setError('Failed to pick winner.')
    } finally {
      setPicking(false)
    }
  }

  if (hasWinner) return null

  return (
    <div className="flex items-center gap-3">
      {status === 'open' && (
        <Button variant="danger" onClick={closeEvent} loading={closing}>
          Close Event
        </Button>
      )}
      {status === 'closed' && !hasWinner && (
        <Button variant="primary" onClick={pickWinner} loading={picking}>
          Pick Winner
        </Button>
      )}
      {error && (
        <span className="text-red-400 text-sm">{error}</span>
      )}
    </div>
  )
}
