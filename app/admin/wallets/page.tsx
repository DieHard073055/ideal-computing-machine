import { prisma } from '@/lib/prisma'
import { ChainBadge } from '@/components/ChainBadge'
import { AdminConfirmButton } from './AdminConfirmButton'

export default async function AdminWalletsPage() {
  const wallets = await prisma.wallet.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      tickets: {
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { name: true } },
        },
      },
    },
    orderBy: { chain: 'asc' },
  })

  const pendingTickets = wallets.flatMap((w) =>
    w.tickets
      .filter((t) => t.status === 'pending')
      .map((t) => ({ ...t, wallet: w, user: w.user }))
  )

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-winzee-indigo mb-8">Wallets &amp; Pending Confirmations</h1>

      {pendingTickets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-display font-semibold text-winzee-indigo mb-4">
            Pending Tickets ({pendingTickets.length})
          </h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-winzee-bg">
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Ticket #</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Event</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Chain</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Tx Hash</th>
                    <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-50 hover:bg-winzee-bg/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-winzee-purple font-medium text-sm">{ticket.ticketNumber}</td>
                      <td className="px-4 py-3 text-winzee-indigo text-sm">{ticket.event.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-winzee-indigo text-sm font-medium">{ticket.user.name}</div>
                        <div className="text-winzee-muted text-xs">{ticket.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <ChainBadge chain={ticket.chain} />
                      </td>
                      <td className="px-4 py-3 font-mono text-winzee-muted text-xs">
                        {ticket.txHash ? `${ticket.txHash.slice(0, 10)}...` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <AdminConfirmButton ticketId={ticket.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-display font-semibold text-winzee-indigo mb-4">All Wallets ({wallets.length})</h2>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 bg-winzee-bg">
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Chain</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Address</th>
                <th className="text-left px-4 py-3 text-winzee-muted text-xs font-semibold uppercase tracking-wide">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr key={wallet.id} className="border-b border-gray-50 hover:bg-winzee-bg/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-winzee-indigo text-sm font-medium">{wallet.user.name}</div>
                    <div className="text-winzee-muted text-xs">{wallet.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <ChainBadge chain={wallet.chain} />
                  </td>
                  <td className="px-4 py-3 font-mono text-winzee-muted text-xs">
                    {wallet.address.slice(0, 12)}...{wallet.address.slice(-6)}
                  </td>
                  <td className="px-4 py-3 text-winzee-muted text-sm">{wallet.tickets.length}</td>
                </tr>
              ))}
              {wallets.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-winzee-muted text-sm">
                    No wallets yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
