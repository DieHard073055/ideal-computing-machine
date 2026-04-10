import { prisma } from '@/lib/prisma'
import { checkEVMPayments, TransferResult } from './evm'

interface BatchRequest {
  addresses: string[]
  chain: string
  walletIds: string[]
  resolve: (results: Record<string, boolean>) => void
}

const pendingBatches = new Map<string, BatchRequest[]>()
const timers = new Map<string, NodeJS.Timeout>()

export async function schedulePaymentCheck(params: {
  chain: string
  addresses: string[]
  walletIds: string[]
}): Promise<Record<string, boolean>> {
  return new Promise((resolve) => {
    if (!pendingBatches.has(params.chain)) pendingBatches.set(params.chain, [])
    pendingBatches.get(params.chain)!.push({ ...params, resolve })

    if (!timers.has(params.chain)) {
      const timer = setTimeout(() => processBatch(params.chain), 10000)
      timers.set(params.chain, timer)
    }
  })
}

async function confirmTicketsForAddress(transfer: TransferResult) {
  try {
    const wallet = await prisma.wallet.findFirst({
      where: { address: { equals: transfer.to, mode: 'insensitive' } },
    })

    if (!wallet) return

    await prisma.ticket.updateMany({
      where: {
        walletId: wallet.id,
        status: 'pending',
        OR: [{ txHash: transfer.txHash }, { txHash: null }],
      },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        txHash: transfer.txHash,
        amount: transfer.amount,
      },
    })
  } catch (e) {
    console.error('Error confirming ticket for address:', transfer.to, e)
  }
}

async function processBatch(chain: string) {
  timers.delete(chain)
  const batch = pendingBatches.get(chain) ?? []
  pendingBatches.delete(chain)

  const allAddresses = Array.from(new Set(batch.flatMap((b) => b.addresses)))

  let transfers: TransferResult[] = []
  try {
    transfers = await checkEVMPayments(chain, allAddresses, 0)
  } catch (e) {
    console.error('Payment check failed:', e)
  }

  const confirmedAddresses = new Set(transfers.map((t) => t.to.toLowerCase()))

  for (const transfer of transfers) {
    await confirmTicketsForAddress(transfer)
  }

  for (const req of batch) {
    const results: Record<string, boolean> = {}
    for (const addr of req.addresses) {
      results[addr] = confirmedAddresses.has(addr.toLowerCase())
    }
    req.resolve(results)
  }
}
