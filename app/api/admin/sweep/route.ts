import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sweepEVM } from '@/lib/payment/sweep'

const EVM_CHAINS = ['base', 'arbitrum', 'bnb', 'polygon']

function getTreasuryConfig(chain: string): { address: string; privateKey: string } | null {
  // Per-chain overrides → fall back to the generic EVM treasury
  const addrKey = `TREASURY_${chain.toUpperCase()}_ADDRESS`
  const pkKey = `TREASURY_${chain.toUpperCase()}_PRIVATE_KEY`

  const address = process.env[addrKey] ?? process.env.TREASURY_EVM_ADDRESS ?? ''
  const privateKey = process.env[pkKey] ?? process.env.TREASURY_EVM_PRIVATE_KEY ?? ''

  if (!address || !privateKey) return null
  return { address, privateKey }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Optional: sweep only a specific chain
  const body = await request.json().catch(() => ({}))
  const filterChain: string | undefined = body.chain

  // Load all wallets with their encrypted keys, grouped by chain
  const wallets = await prisma.wallet.findMany({
    select: {
      id: true,
      chain: true,
      address: true,
      encryptedKey: true,
    },
    orderBy: { chain: 'asc' },
  })

  const byChain: Record<string, { address: string; encryptedKey: string }[]> = {}
  for (const w of wallets) {
    if (filterChain && w.chain !== filterChain) continue
    if (!EVM_CHAINS.includes(w.chain)) continue
    if (!byChain[w.chain]) byChain[w.chain] = []
    byChain[w.chain].push({ address: w.address, encryptedKey: w.encryptedKey })
  }

  const allResults = []
  const errors: string[] = []

  for (const [chain, chainWallets] of Object.entries(byChain)) {
    const treasury = getTreasuryConfig(chain)
    if (!treasury) {
      errors.push(`No treasury configured for chain: ${chain}. Set TREASURY_${chain.toUpperCase()}_ADDRESS and TREASURY_${chain.toUpperCase()}_PRIVATE_KEY env vars.`)
      continue
    }

    try {
      const results = await sweepEVM(chain, chainWallets, treasury.address, treasury.privateKey)
      allResults.push(...results)
    } catch (err) {
      errors.push(`${chain}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const swept = allResults.filter((r) => r.status === 'swept')
  const totalSwept = swept.reduce((sum, r) => sum + r.tokenAmount, 0)

  return NextResponse.json({
    results: allResults,
    summary: {
      total: allResults.length,
      swept: swept.length,
      skipped: allResults.filter((r) => r.status === 'skipped').length,
      errors: allResults.filter((r) => r.status === 'error').length,
      totalTokenAmount: totalSwept,
    },
    configErrors: errors,
  })
}
