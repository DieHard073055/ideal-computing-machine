'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ChainBadge } from './ChainBadge'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

interface WalletCardProps {
  wallet: {
    id: string
    chain: string
    address: string
  }
  eventId?: string
  onRefresh?: () => void
}

export function WalletCard({ wallet, eventId, onRefresh }: WalletCardProps) {
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<string | null>(null)

  const copyAddress = async () => {
    await navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRefresh = async () => {
    if (!eventId) {
      onRefresh?.()
      return
    }
    setRefreshing(true)
    setRefreshResult(null)
    try {
      const res = await fetch('/api/payments/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      const data = await res.json()
      if (data.confirmed) {
        setRefreshResult('Payment confirmed!')
      } else {
        setRefreshResult('No payment found yet. Try again in a moment.')
      }
    } catch {
      setRefreshResult('Error checking payment.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <ChainBadge chain={wallet.chain} />
        <span className="text-xs text-winzee-muted uppercase tracking-wide font-medium">{wallet.chain}</span>
      </div>

      <div className="flex items-center gap-2 bg-winzee-bg rounded-xl px-3 py-2">
        <span className="font-mono text-winzee-indigo text-xs break-all flex-1">{wallet.address}</span>
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

      <div className="flex justify-center bg-winzee-bg p-4 rounded-xl">
        <QRCodeSVG value={wallet.address} size={140} fgColor="#1B1030" />
      </div>

      {(eventId || onRefresh) && (
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            loading={refreshing}
            className="w-full"
          >
            Refresh Payment Status
          </Button>
          {refreshResult && (
            <p className={`text-sm text-center font-medium ${refreshResult.includes('confirmed') ? 'text-emerald-600' : 'text-amber-600'}`}>
              {refreshResult}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
