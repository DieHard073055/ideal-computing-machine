import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { tickets: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-winzee-indigo">Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white px-5 py-2 rounded-pill text-sm font-semibold shadow-winzee hover:shadow-winzee-lg transition-all active:scale-[0.98]"
        >
          + Create Event
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 bg-winzee-bg">
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Chains</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Tickets</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-50 hover:bg-winzee-bg/50 transition-colors">
                  <td className="px-4 py-3 text-winzee-indigo font-medium text-sm">{event.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-winzee-dark border border-purple-200">
                      All chains
                    </span>
                  </td>
                  <td className="px-4 py-3 text-winzee-muted text-sm">${event.ticketPrice}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      event.status === 'open' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-winzee-muted text-sm">{event._count.tickets}</td>
                  <td className="px-4 py-3 text-winzee-muted text-sm">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${event.id}`} className="text-winzee-purple hover:text-winzee-purple2 text-sm font-medium">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-winzee-muted text-sm">
                    No events yet.{' '}
                    <Link href="/admin/events/new" className="text-winzee-purple hover:text-winzee-purple2 font-medium">
                      Create one
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
