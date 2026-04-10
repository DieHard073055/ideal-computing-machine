import React from 'react'

interface ChainBadgeProps {
  chain: string
  className?: string
}

const CHAIN_STYLES: Record<string, { label: string; className: string; icon: string }> = {
  base:     { label: 'Base', icon: '🔵', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  arbitrum: { label: 'Arbitrum', icon: '🔷', className: 'bg-sky-50 text-sky-700 border-sky-200' },
}

export function ChainBadge({ chain, className = '' }: ChainBadgeProps) {
  const config = CHAIN_STYLES[chain] ?? { label: chain, icon: '◎', className: 'bg-gray-100 text-gray-600 border-gray-200' }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  )
}
