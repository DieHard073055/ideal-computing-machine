import React from 'react'
import Link from 'next/link'
import { ChainBadge } from './ChainBadge'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'

interface EventCardProps {
  event: {
    id: string
    name: string
    description?: string | null
    ticketPrice: number
    status: string
    _count?: { tickets: number }
  }
  linkPrefix?: string
}

const STATUS_VARIANTS: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  open: 'green',
  closed: 'yellow',
  completed: 'gray',
}

const ALL_CHAINS = ['ethereum', 'bnb', 'polygon', 'solana', 'tron']

export function EventCard({ event, linkPrefix = '/dashboard/events' }: EventCardProps) {
  return (
    <Card className="hover:shadow-card-hover transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-display font-semibold text-winzee-indigo truncate pr-2">{event.name}</h3>
        <Badge variant={STATUS_VARIANTS[event.status] ?? 'gray'}>
          {event.status}
        </Badge>
      </div>

      {event.description && (
        <p className="text-winzee-muted text-sm mb-3 line-clamp-2 leading-relaxed">{event.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {ALL_CHAINS.map((chain) => (
          <ChainBadge key={chain} chain={chain} />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm mb-4 mt-auto">
        <div>
          <span className="text-winzee-muted">Price: </span>
          <span className="text-winzee-indigo font-bold">${event.ticketPrice}</span>
        </div>
        {event._count !== undefined && (
          <span className="text-winzee-muted text-xs">{event._count.tickets} tickets sold</span>
        )}
      </div>

      <Link
        href={`${linkPrefix}/${event.id}`}
        className="block w-full text-center py-2.5 px-4 bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white text-sm font-semibold rounded-pill shadow-winzee hover:shadow-winzee-lg transition-all active:scale-[0.98]"
      >
        {event.status === 'open' ? 'Enter Draw' : 'View Details'}
      </Link>
    </Card>
  )
}
