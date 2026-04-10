'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Wallet {
  id: string
  chain: string
  address: string
}

interface BuyTicketFormProps {
  eventId: string
  wallets: Wallet[]
  ticketPrice: number
}

const CHAIN_META: Record<string, { label: string; token: string; icon: string }> = {
  base:     { label: 'Base',     token: 'USDC', icon: '🔵' },
  arbitrum: { label: 'Arbitrum', token: 'USDC', icon: '🔷' },
  bnb:      { label: 'BNB Chain', token: 'USDC', icon: '⬡' },
  polygon:  { label: 'Polygon',  token: 'USDC', icon: '⬟' },
}

export function BuyTicketForm({ eventId, wallets, ticketPrice }: BuyTicketFormProps) {
  const router = useRouter()
  const [selectedChain, setSelectedChain] = useState(wallets[0]?.chain ?? 'base')
  const [txHash, setTxHash] = useState('')
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refreshResult, setRefreshResult] = useState('')

  const activeWallet = wallets.find((w) => w.chain === selectedChain) ?? wallets[0]
  const meta = CHAIN_META[activeWallet?.chain] ?? { label: activeWallet?.chain, token: 'USDC', icon: '◎' }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(activeWallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/events/${eventId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash, walletId: activeWallet.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to create ticket')
        return
      }

      setSuccess(`Ticket purchased — good luck! Ticket #: ${data.ticketNumber}`)
      setTxHash('')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefresh = async () => {
    setChecking(true)
    setRefreshResult('')

    try {
      const res = await fetch('/api/payments/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      const data = await res.json()

      if (data.confirmed) {
        setRefreshResult('Payment confirmed! Your ticket is now active.')
        router.refresh()
      } else {
        setRefreshResult('Payment not yet detected. Please wait and try again.')
      }
    } catch {
      setRefreshResult('Error checking payment.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
      <h2 className="text-xl font-display font-bold text-winzee-indigo mb-1">Buy a Ticket</h2>
      <p className="text-winzee-muted text-sm mb-6">
        Choose your chain, send ${ticketPrice} to your wallet, then register your transaction.
      </p>

      {/* Step 1: Chain selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-winzee-purple to-winzee-purple2 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
          <h3 className="text-sm font-semibold text-winzee-indigo">Choose a chain</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {wallets.map((wallet) => {
            const isActive = wallet.chain === selectedChain
            const m = CHAIN_META[wallet.chain] ?? { icon: '◎', label: wallet.chain }
            return (
              <button
                key={wallet.chain}
                onClick={() => { setSelectedChain(wallet.chain); setTxHash(''); setError(''); setSuccess('') }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isActive
                    ? 'bg-winzee-purple text-white border-winzee-purple shadow-winzee'
                    : 'bg-winzee-bg border-gray-200 text-winzee-muted hover:border-winzee-purple/40 hover:text-winzee-indigo'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Wallet address */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-winzee-purple to-winzee-purple2 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h3 className="text-sm font-semibold text-winzee-indigo">
            Send <span className="text-winzee-purple">${ticketPrice} {meta.token}</span> on {meta.label}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="bg-winzee-bg p-3 rounded-xl flex-shrink-0 self-center sm:self-start">
            <QRCodeSVG value={activeWallet.address} size={120} fgColor="#1B1030" />
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="bg-winzee-bg border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="font-mono text-winzee-indigo text-xs break-all">{activeWallet.address}</span>
              <button
                onClick={copyAddress}
                className="flex-shrink-0 text-winzee-muted hover:text-winzee-purple transition-colors p-1 rounded-lg hover:bg-winzee-purple/10"
                title="Copy address"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-winzee-muted text-xs mt-2">
              Your dedicated {meta.label} deposit address. Send the exact amount.
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Submit tx hash */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-winzee-purple to-winzee-purple2 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
          <h3 className="text-sm font-semibold text-winzee-indigo">Enter your transaction hash</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="0x... or your transaction ID"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm font-medium">
              {success}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" loading={submitting} className="flex-1">
              Register Ticket
            </Button>
            <Button type="button" variant="secondary" onClick={handleRefresh} loading={checking}>
              Check Payment
            </Button>
          </div>

          {refreshResult && (
            <p className={`text-sm font-medium ${refreshResult.includes('confirmed') ? 'text-emerald-600' : 'text-amber-600'}`}>
              {refreshResult}
            </p>
          )}
        </form>
      </div>

      <p className="text-winzee-muted text-xs">
        The payment checker runs automatically every 10 seconds. Your ticket confirms once the transfer is detected on-chain.
      </p>
    </div>
  )
}
