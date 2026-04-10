'use client'

import { useState } from 'react'
import { ChainBadge } from '@/components/ChainBadge'

interface SweepResult {
  walletAddress: string
  chain: string
  tokenAmount: number
  txHash: string
  status: 'swept' | 'skipped' | 'error'
  error?: string
}

interface SweepResponse {
  results: SweepResult[]
  summary: {
    total: number
    swept: number
    skipped: number
    errors: number
    totalTokenAmount: number
  }
  configErrors: string[]
}

export default function SweepPage() {
  const [selectedChain, setSelectedChain] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<SweepResponse | null>(null)
  const [error, setError] = useState('')

  const handleSweep = async () => {
    if (!confirm(
      `This will transfer ALL token balances from ALL user wallets${selectedChain ? ` on ${selectedChain}` : ''} to the configured treasury address.\n\nContinue?`
    )) return

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch('/api/admin/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedChain ? { chain: selectedChain } : {}),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Sweep failed')
        return
      }
      setResponse(data)
    } catch {
      setError('Request failed. Check server logs.')
    } finally {
      setLoading(false)
    }
  }

  const swept = response?.results.filter((r) => r.status === 'swept') ?? []
  const errors = response?.results.filter((r) => r.status === 'error') ?? []

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-winzee-indigo mb-1">Sweep Funds</h1>
        <p className="text-winzee-muted text-sm">
          Transfer all token balances from user deposit wallets to the treasury address configured
          via environment variables.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-winzee-bg border border-gray-100 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-winzee-indigo mb-3">How it works</h2>
        <ol className="text-sm text-winzee-muted space-y-2 list-decimal list-inside">
          <li>Each user wallet with a non-zero token balance is found.</li>
          <li>The treasury wallet sends a tiny ETH gas stipend to that wallet.</li>
          <li>The user wallet transfers its full token balance to the treasury.</li>
          <li>Wallets with zero balance are skipped.</li>
        </ol>
      </div>

      {/* Required env vars */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-amber-800 mb-2">Required environment variables</h2>
        <div className="font-mono text-xs text-amber-700 space-y-1">
          <p>TREASURY_EVM_ADDRESS=0x...          <span className="text-amber-500"># or per-chain: TREASURY_BASE_ADDRESS / TREASURY_ARBITRUM_ADDRESS</span></p>
          <p>TREASURY_EVM_PRIVATE_KEY=0x...      <span className="text-amber-500"># must hold ETH for gas on Base and Arbitrum</span></p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-winzee-indigo block mb-1.5">
              Chain (leave blank to sweep all)
            </label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full bg-white border border-gray-200 text-winzee-indigo rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-winzee-lime/50 focus:border-winzee-purple"
            >
              <option value="">All chains</option>
              <option value="base">Base</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="bnb">BNB Chain</option>
              <option value="polygon">Polygon</option>
            </select>
          </div>
          <button
            onClick={handleSweep}
            disabled={loading}
            className="bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white px-6 py-2.5 rounded-pill font-semibold text-sm shadow-winzee hover:shadow-winzee-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sweeping…
              </span>
            ) : (
              'Sweep Funds'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-600 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Config errors */}
      {response?.configErrors && response.configErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Configuration warnings</h3>
          {response.configErrors.map((e, i) => (
            <p key={i} className="text-amber-700 text-sm">{e}</p>
          ))}
        </div>
      )}

      {/* Summary */}
      {response && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-card">
              <div className="text-2xl font-display font-bold text-emerald-600">{response.summary.swept}</div>
              <div className="text-winzee-muted text-xs mt-1">Swept</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-card">
              <div className="text-2xl font-display font-bold text-winzee-muted">{response.summary.skipped}</div>
              <div className="text-winzee-muted text-xs mt-1">Skipped (empty)</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-card">
              <div className="text-2xl font-display font-bold text-red-500">{response.summary.errors}</div>
              <div className="text-winzee-muted text-xs mt-1">Errors</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-card">
              <div className="text-2xl font-display font-bold text-winzee-purple">
                ${response.summary.totalTokenAmount.toFixed(2)}
              </div>
              <div className="text-winzee-muted text-xs mt-1">Total swept</div>
            </div>
          </div>

          {/* Swept rows */}
          {swept.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card mb-4">
              <div className="px-4 py-3 border-b border-gray-100 bg-winzee-bg">
                <h3 className="text-sm font-semibold text-emerald-700">Swept ({swept.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left px-4 py-2 text-winzee-muted text-xs font-medium">Chain</th>
                      <th className="text-left px-4 py-2 text-winzee-muted text-xs font-medium">Wallet</th>
                      <th className="text-left px-4 py-2 text-winzee-muted text-xs font-medium">Amount</th>
                      <th className="text-left px-4 py-2 text-winzee-muted text-xs font-medium">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swept.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-winzee-bg/50">
                        <td className="px-4 py-2.5"><ChainBadge chain={r.chain} /></td>
                        <td className="px-4 py-2.5 font-mono text-winzee-muted text-xs">
                          {r.walletAddress.slice(0, 10)}…{r.walletAddress.slice(-6)}
                        </td>
                        <td className="px-4 py-2.5 text-winzee-indigo font-medium text-sm">
                          ${r.tokenAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-winzee-muted text-xs">
                          {r.txHash ? `${r.txHash.slice(0, 12)}…` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-card mb-4">
              <div className="px-4 py-3 border-b border-red-100 bg-red-50">
                <h3 className="text-sm font-semibold text-red-600">Errors ({errors.length})</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {errors.map((r, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ChainBadge chain={r.chain} />
                      <span className="font-mono text-xs text-winzee-muted">
                        {r.walletAddress.slice(0, 10)}…{r.walletAddress.slice(-6)}
                      </span>
                    </div>
                    <p className="text-red-500 text-xs">{r.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
