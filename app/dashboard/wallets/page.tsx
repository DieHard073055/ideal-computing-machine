import { getSession } from '@/lib/auth'
import { getOrCreateWallet } from '@/lib/wallet'
import { WalletCard } from '@/components/WalletCard'

const CHAINS = ['base', 'arbitrum', 'bnb', 'polygon']

export default async function WalletsPage() {
  const session = await getSession()
  if (!session) return null

  const wallets = await Promise.all(
    CHAINS.map((chain) => getOrCreateWallet(session.sub, chain))
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-winzee-indigo">My Wallets</h1>
        <p className="text-winzee-muted mt-1 text-sm">
          These are your dedicated deposit wallets. Send USDC to the address for the chain you want to use.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} />
        ))}
      </div>
    </div>
  )
}
