'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function NewEventPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, ticketPrice: parseFloat(ticketPrice) }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to create event')
        return
      }

      router.push(`/admin/events/${data.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-display font-bold text-winzee-indigo mb-2">Create New Event</h1>
      <p className="text-winzee-muted text-sm mb-8">
        Events automatically accept payment on all 5 chains — Ethereum, BNB, Polygon, Solana, and TRON.
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Monthly Lucky Draw"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-winzee-indigo">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event..."
              rows={3}
              className="bg-white border border-gray-200 text-winzee-indigo placeholder-winzee-muted/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-winzee-lime/50 focus:border-winzee-purple transition-all resize-none"
            />
          </div>

          <Input
            label="Ticket Price (USDT/USDC)"
            type="number"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            placeholder="10"
            min="0.01"
            step="0.01"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Create Event
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
