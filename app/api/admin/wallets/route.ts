import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const wallets = await prisma.wallet.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        tickets: {
          where: { status: 'pending' },
          select: { id: true, ticketNumber: true, status: true, createdAt: true },
        },
      },
      orderBy: { chain: 'asc' },
    })

    return NextResponse.json(wallets.map((w) => ({
      id: w.id,
      chain: w.chain,
      address: w.address,
      user: w.user,
      pendingTickets: w.tickets,
    })))
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get wallets' }, { status: 500 })
  }
}
