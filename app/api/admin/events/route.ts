import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const events = await prisma.event.findMany({
      include: {
        _count: { select: { tickets: true } },
        winner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(events)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, description, ticketPrice } = body

    if (!name || !ticketPrice) {
      return NextResponse.json({ error: 'name and ticketPrice are required' }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        name,
        description: description || null,
        ticketPrice: parseFloat(ticketPrice),
        status: 'open',
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
