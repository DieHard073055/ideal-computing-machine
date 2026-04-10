import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: params.ticketId } })
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const updated = await prisma.ticket.update({
      where: { id: params.ticketId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to confirm ticket' }, { status: 500 })
  }
}
