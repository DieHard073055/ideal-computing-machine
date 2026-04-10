import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { eventId: params.eventId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        wallet: { select: { address: true, chain: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tickets)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get tickets' }, { status: 500 })
  }
}
