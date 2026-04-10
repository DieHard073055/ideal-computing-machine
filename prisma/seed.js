// Compiled seed script (CommonJS) — used by docker-entrypoint.sh
'use strict'

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'changeme', 10)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? 'admin@lucky.local' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL ?? 'admin@lucky.local',
      name: 'Admin',
      passwordHash,
      isAdmin: true,
    },
  })

  await prisma.event.upsert({
    where: { id: 'sample-event-1' },
    update: {},
    create: {
      id: 'sample-event-1',
      name: 'Welcome Draw',
      description: 'Our first lucky draw event!',
      ticketPrice: 10,
      status: 'open',
    },
  })

  console.log('Seed complete:', admin.email)
}

main().catch(console.error).finally(() => prisma.$disconnect())
