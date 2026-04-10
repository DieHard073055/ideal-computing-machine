import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { WinnerBanner } from '@/components/WinnerBanner'
import { getOrCreateWallet } from '@/lib/wallet'
import { BuyTicketForm } from './BuyTicketForm'
import { TicketCard } from '@/components/TicketCard'

const ALL_CHAINS = ['ethereum', 'bnb', 'polygon', 'solana', 'tron']

export default async function EventDetailPage({
  params,
}: {
  params: { eventId: string }
}) {
  const session = await getSession()
  if (!session) return null

  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    include: {
      winner: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      _count: { select: { tickets: true } },
    },
  })

  if (!event) notFound()

  const wallets = await Promise.all(
    ALL_CHAINS.map((chain) => getOrCreateWallet(session.sub, chain))
  )

  const myTickets = await prisma.ticket.findMany({
    where: { eventId: params.eventId, userId: session.sub },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-2xl font-display font-bold text-winzee-indigo">{event.name}</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-winzee-dark border border-purple-200">
            All chains
          </span>
        </div>
        {event.description && (
          <p className="text-winzee-muted text-sm">{event.description}</p>
        )}
      </div>

      {event.winner && (
        <div className="mb-8">
          <WinnerBanner
            ticketNumber={event.winner.ticketNumber}
            userName={event.winner.user.name}
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-card">
          <div className="text-2xl font-display font-bold text-winzee-purple">${event.ticketPrice}</div>
          <div className="text-winzee-muted text-sm mt-1">Ticket Price</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-card">
          <div className="text-2xl font-display font-bold text-winzee-purple">{event._count.tickets}</div>
          <div className="text-winzee-muted text-sm mt-1">Tickets Sold</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-card">
          <div className={`text-2xl font-display font-bold ${event.status === 'open' ? 'text-emerald-600' : 'text-winzee-muted'}`}>
            {event.status}
          </div>
          <div className="text-winzee-muted text-sm mt-1">Status</div>
        </div>
      </div>

      {event.status === 'open' && (
        <BuyTicketForm
          eventId={params.eventId}
          wallets={wallets}
          ticketPrice={event.ticketPrice}
        />
      )}

      {myTickets.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-display font-semibold text-winzee-indigo mb-4">My Tickets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
