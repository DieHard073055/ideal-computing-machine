import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ChainBadge } from '@/components/ChainBadge'
import { WinnerBanner } from '@/components/WinnerBanner'
import { AdminEventActions } from './AdminEventActions'

export default async function AdminEventDetailPage({
  params,
}: {
  params: { eventId: string }
}) {
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

  const tickets = await prisma.ticket.findMany({
    where: { eventId: params.eventId },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl font-display font-bold text-winzee-indigo">{event.name}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-winzee-dark border border-purple-200">
              All chains
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              event.status === 'open' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
              event.status === 'completed' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
              'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              {event.status}
            </span>
          </div>
          {event.description && (
            <p className="text-winzee-muted text-sm">{event.description}</p>
          )}
          <p className="text-winzee-muted text-sm mt-1">
            Ticket price: ${event.ticketPrice} · {event._count.tickets} tickets sold
          </p>
        </div>
      </div>

      {event.winner && (
        <div className="mb-8">
          <WinnerBanner
            ticketNumber={event.winner.ticketNumber}
            userName={event.winner.user.name}
          />
        </div>
      )}

      <AdminEventActions
        eventId={params.eventId}
        status={event.status}
        hasWinner={!!event.winnerId}
      />

      <div className="mt-8">
        <h2 className="text-xl font-display font-semibold text-winzee-indigo mb-4">
          Tickets ({tickets.length})
        </h2>

        {tickets.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-winzee-muted shadow-card">
            No tickets yet.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-winzee-bg">
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Ticket #</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Chain</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Tx Hash</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-50 hover:bg-winzee-bg/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-winzee-purple font-medium text-sm">{ticket.ticketNumber}</td>
                      <td className="px-4 py-3">
                        <div className="text-winzee-indigo text-sm font-medium">{ticket.user.name}</div>
                        <div className="text-winzee-muted text-xs">{ticket.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <ChainBadge chain={ticket.chain} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          ticket.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          ticket.status === 'rejected' ? 'bg-red-100 text-red-600 border border-red-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-winzee-muted text-xs">
                        {ticket.txHash
                          ? `${ticket.txHash.slice(0, 10)}...${ticket.txHash.slice(-6)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-winzee-muted text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
