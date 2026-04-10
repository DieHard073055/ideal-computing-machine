import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TicketCard } from '@/components/TicketCard'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.sub },
    include: {
      event: {
        select: { id: true, name: true, ticketPrice: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-winzee-indigo">My Tickets</h1>
        <Link
          href="/dashboard/events"
          className="bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white px-5 py-2.5 rounded-pill text-sm font-semibold shadow-winzee hover:shadow-winzee-lg transition-all active:scale-[0.98]"
        >
          Browse Events
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-card">
          <div className="text-5xl mb-4">🎟️</div>
          <h2 className="text-xl font-display font-semibold text-winzee-indigo mb-2">No tickets yet</h2>
          <p className="text-winzee-muted mb-6">Browse open events and buy your first ticket!</p>
          <Link
            href="/dashboard/events"
            className="inline-block bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white px-7 py-3 rounded-pill text-sm font-semibold shadow-winzee hover:shadow-winzee-lg transition-all active:scale-[0.98]"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
