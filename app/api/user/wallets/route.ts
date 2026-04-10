import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getOrCreateWallet } from '@/lib/wallet'

const CHAINS = ['base', 'arbitrum']

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const wallets = await Promise.all(
      CHAINS.map((chain) => getOrCreateWallet(session.sub, chain))
    )
    return NextResponse.json(wallets)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get wallets' }, { status: 500 })
  }
}
