import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { txHash, walletId } = body

    if (!walletId) {
      return NextResponse.json({ error: 'walletId is required' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({ where: { id: params.eventId } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    if (event.status !== 'open') {
      return NextResponse.json({ error: 'Event is not open' }, { status: 400 })
    }

    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } })
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }
    if (wallet.userId !== session.sub) {
      return NextResponse.json({ error: 'Wallet does not belong to you' }, { status: 403 })
    }

    const ticketCount = await prisma.ticket.count({ where: { eventId: params.eventId } })
    const sequence = String(ticketCount + 1).padStart(4, '0')
    const shortId = params.eventId.slice(0, 6).toUpperCase()
    const ticketNumber = `EVT-${shortId}-${sequence}`

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        eventId: params.eventId,
        userId: session.sub,
        walletId,
        chain: wallet.chain,   // chain comes from the wallet the user chose
        txHash: txHash || null,
        amount: event.ticketPrice,
        status: 'pending',
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { eventId: params.eventId, userId: session.sub },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tickets)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get tickets' }, { status: 500 })
  }
}
