import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.winnerId) {
      return NextResponse.json({ error: 'Winner already picked' }, { status: 400 })
    }

    const confirmedTickets = await prisma.ticket.findMany({
      where: { eventId: params.eventId, status: 'confirmed' },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    if (confirmedTickets.length === 0) {
      return NextResponse.json({ error: 'No confirmed tickets for this event' }, { status: 400 })
    }

    const winnerTicket = confirmedTickets[Math.floor(Math.random() * confirmedTickets.length)]

    const updatedEvent = await prisma.event.update({
      where: { id: params.eventId },
      data: {
        winnerId: winnerTicket.id,
        status: 'completed',
        closedAt: new Date(),
      },
      include: {
        winner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({
      event: updatedEvent,
      winner: {
        ticketId: winnerTicket.id,
        ticketNumber: winnerTicket.ticketNumber,
        userName: winnerTicket.user.name,
        userEmail: winnerTicket.user.email,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to pick winner' }, { status: 500 })
  }
}
