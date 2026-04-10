import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { schedulePaymentCheck } from '@/lib/payment/batcher'

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Find all pending tickets the user has for this event, with their wallets.
    const pendingTickets = await prisma.ticket.findMany({
      where: { eventId, userId: session.sub, status: 'pending' },
      include: { wallet: { select: { id: true, address: true, chain: true } } },
    })

    if (pendingTickets.length === 0) {
      return NextResponse.json({ results: {}, confirmed: false })
    }

    // Group by chain so we fire one batched RPC call per chain.
    const byChain = new Map<string, { walletId: string; address: string }[]>()
    for (const ticket of pendingTickets) {
      const { chain, id: walletId, address } = ticket.wallet
      if (!byChain.has(chain)) byChain.set(chain, [])
      byChain.get(chain)!.push({ walletId, address })
    }

    // Schedule a batched check for each chain simultaneously.
    const chainEntries = Array.from(byChain.entries())
    const checkResults = await Promise.all(
      chainEntries.map(([chain, wallets]) =>
        schedulePaymentCheck({
          chain,
          addresses: Array.from(new Set(wallets.map((w) => w.address))),
          walletIds: Array.from(new Set(wallets.map((w) => w.walletId))),
        })
      )
    )

    // Merge per-address results from every chain.
    const results: Record<string, boolean> = {}
    for (const chainResult of checkResults) {
      Object.assign(results, chainResult)
    }

    const confirmed = Object.values(results).some(Boolean)
    return NextResponse.json({ results, confirmed })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Payment check failed' }, { status: 500 })
  }
}
