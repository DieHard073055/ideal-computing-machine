import { prisma } from '@/lib/prisma'
import { EventCard } from '@/components/EventCard'

export default async function DashboardEventsPage() {
  const events = await prisma.event.findMany({
    where: { status: 'open' },
    include: { _count: { select: { tickets: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-winzee-indigo mb-8">Open Draws</h1>

      {events.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-card">
          <div className="text-5xl mb-4">🎰</div>
          <p className="text-winzee-muted">No open draws at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
