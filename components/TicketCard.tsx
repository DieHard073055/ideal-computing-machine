import React from 'react'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { ChainBadge } from './ChainBadge'

interface TicketCardProps {
  ticket: {
    id: string
    ticketNumber: string
    status: string
    txHash?: string | null
    chain: string
    amount: number
    confirmedAt?: string | Date | null
    createdAt: string | Date
    event?: {
      name: string
    }
  }
}

const STATUS_VARIANTS: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  confirmed: 'green',
  pending: 'yellow',
  rejected: 'red',
}

function truncate(str: string, len = 16) {
  if (str.length <= len) return str
  return `${str.slice(0, 8)}...${str.slice(-8)}`
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card className="flex flex-col gap-3 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between">
        <span className="font-mono text-winzee-purple font-semibold text-sm">{ticket.ticketNumber}</span>
        <Badge variant={STATUS_VARIANTS[ticket.status] ?? 'gray'}>
          {ticket.status}
        </Badge>
      </div>

      {ticket.event && (
        <div className="flex items-center gap-2">
          <span className="text-winzee-indigo font-medium text-sm">{ticket.event.name}</span>
          <ChainBadge chain={ticket.chain} />
        </div>
      )}

      <div className="flex items-center justify-between py-2 border-t border-gray-50">
        <span className="text-winzee-muted text-sm">Amount</span>
        <span className="text-winzee-indigo font-semibold">${ticket.amount}</span>
      </div>

      {ticket.txHash && (
        <div className="bg-winzee-bg rounded-lg px-3 py-2">
          <span className="text-winzee-muted text-xs">Tx: </span>
          <span className="font-mono text-winzee-indigo text-xs">{truncate(ticket.txHash, 24)}</span>
        </div>
      )}

      <div className="text-xs text-winzee-muted">
        {ticket.confirmedAt && (
          <span>Confirmed {new Date(ticket.confirmedAt).toLocaleDateString()} · </span>
        )}
        <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>
    </Card>
  )
}
