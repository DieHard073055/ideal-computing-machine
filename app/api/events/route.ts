import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'open' },
      include: {
        _count: { select: { tickets: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(events)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get events' }, { status: 500 })
  }
}
