import { EventCard } from '@/components/EventCard'
import Link from 'next/link'

async function getEvents() {
  try {
    const { prisma } = await import('@/lib/prisma')
    const events = await prisma.event.findMany({
      where: { status: 'open' },
      include: { _count: { select: { tickets: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return events
  } catch {
    return []
  }
}

export default async function LandingPage() {
  const events = await getEvents()

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-winzee-dark via-winzee-purple to-winzee-purple2 text-white py-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-winzee-lime/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-winzee-gold/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Logo mark */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-winzee-lg">
              <svg className="w-11 h-11 text-winzee-lime" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-winzee-lime animate-pulse" />
            Multi-chain · Transparent · Instant
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-bold mb-4 leading-tight">
            Play. Dream.{' '}
            <span className="text-winzee-lime">Win.</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Small ticket. Big possibility. Buy lucky draw tickets with USDT or USDC on Ethereum, BNB Chain, Polygon, Solana, or TRON.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-winzee-lime text-winzee-dark px-8 py-3.5 rounded-pill font-bold text-base shadow-winzee-lg hover:brightness-105 transition-all active:scale-[0.98]"
            >
              Play Now
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-pill font-semibold text-base hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-winzee-bg border-b border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 sm:gap-8">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-display font-bold text-winzee-purple">{events.length}</div>
            <div className="text-winzee-muted text-sm mt-0.5">Open Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-display font-bold text-winzee-purple">5</div>
            <div className="text-winzee-muted text-sm mt-0.5">Chains</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-display font-bold text-winzee-purple">100%</div>
            <div className="text-winzee-muted text-sm mt-0.5">On-Chain</div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-winzee-indigo">Open Draws</h2>
          <Link
            href="/dashboard/events"
            className="text-winzee-purple hover:text-winzee-purple2 text-sm font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-winzee-bg border border-gray-100 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🎰</div>
            <p className="text-winzee-muted">No open draws at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} linkPrefix="/dashboard/events" />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-winzee-bg border-t border-gray-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-winzee-indigo text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '🎟️', title: 'Buy a Ticket', desc: 'Choose an event, pick your chain, and send the exact ticket price to your personal wallet.' },
              { icon: '⚡', title: 'Verified On-Chain', desc: 'We automatically detect your payment on the blockchain — no manual confirmation needed.' },
              { icon: '🏆', title: 'Win Big', desc: 'A winner is drawn transparently. If it\'s you, you\'ll see it right here on your dashboard.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-display font-semibold text-winzee-indigo text-lg mb-2">{title}</h3>
                <p className="text-winzee-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chains */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-display font-bold text-winzee-indigo text-center mb-8">Supported Chains</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { chain: 'base',     label: 'Base',      icon: '🔵' },
            { chain: 'arbitrum', label: 'Arbitrum',  icon: '🔷' },
            { chain: 'bnb',      label: 'BNB Chain', icon: '⬡' },
            { chain: 'polygon',  label: 'Polygon',   icon: '⬟' },
          ].map(({ chain, label, icon }) => (
            <div key={chain} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-card hover:shadow-card-hover transition-shadow">
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-winzee-indigo font-medium text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to win?</h2>
          <p className="text-white/70 mb-8">Spin into possibility. Dreams start here.</p>
          <Link
            href="/register"
            className="inline-block bg-winzee-lime text-winzee-dark px-10 py-3.5 rounded-pill font-bold text-base shadow-winzee-lg hover:brightness-105 transition-all active:scale-[0.98]"
          >
            Start Playing
          </Link>
        </div>
      </section>
    </main>
  )
}
