import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const [eventsCount, ticketsCount, openEventsCount, confirmedTickets] = await Promise.all([
    prisma.event.count(),
    prisma.ticket.count(),
    prisma.event.count({ where: { status: 'open' } }),
    prisma.ticket.count({ where: { status: 'confirmed' } }),
  ])

  const recentEvents = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { tickets: true } } },
  })

  const stats = [
    { label: 'Total Events', value: eventsCount, color: 'text-winzee-purple' },
    { label: 'Open Events', value: openEventsCount, color: 'text-emerald-600' },
    { label: 'Total Tickets', value: ticketsCount, color: 'text-amber-600' },
    { label: 'Confirmed', value: confirmedTickets, color: 'text-blue-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-winzee-indigo mb-8">Admin Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
            <div className={`text-3xl font-display font-bold ${color}`}>{value}</div>
            <div className="text-winzee-muted text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-semibold text-winzee-indigo">Recent Events</h2>
        <Link
          href="/admin/events/new"
          className="bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white px-5 py-2 rounded-pill text-sm font-semibold shadow-winzee hover:shadow-winzee-lg transition-all active:scale-[0.98]"
        >
          + Create Event
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 bg-winzee-bg">
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Chains</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Tickets</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-gray-50 hover:bg-winzee-bg/50 transition-colors">
                  <td className="px-4 py-3 text-winzee-indigo font-medium text-sm">{event.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-winzee-dark border border-purple-200">
                      All chains
                    </span>
                  </td>
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
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${event.id}`} className="text-winzee-purple hover:text-winzee-purple2 text-sm font-medium">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-winzee-muted text-sm">
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
