import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: session.sub },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            ticketPrice: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tickets)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get tickets' }, { status: 500 })
  }
}
