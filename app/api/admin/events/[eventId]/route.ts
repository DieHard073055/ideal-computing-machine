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
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: {
        winner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        _count: { select: { tickets: true } },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get event' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { status } = body

    const event = await prisma.event.update({
      where: { id: params.eventId },
      data: {
        status,
        closedAt: status === 'closed' ? new Date() : undefined,
      },
    })

    return NextResponse.json(event)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}
