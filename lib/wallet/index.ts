import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/crypto'
import { generateEVMWallet } from './evm'

export async function getOrCreateWallet(userId: string, chain: string) {
  const existing = await prisma.wallet.findUnique({
    where: { userId_chain: { userId, chain } },
  })

  if (existing) {
    return { id: existing.id, chain: existing.chain, address: existing.address }
  }

  const keypair = generateEVMWallet()
  const encryptedKey = encrypt(keypair.privateKey)

  const wallet = await prisma.wallet.create({
    data: {
      userId,
      chain,
      address: keypair.address,
      encryptedKey,
    },
  })

  return { id: wallet.id, chain: wallet.chain, address: wallet.address }
}
