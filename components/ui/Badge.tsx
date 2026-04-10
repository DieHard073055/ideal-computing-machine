import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'lime' | 'gold'
  className?: string
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variants = {
    green: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border border-amber-200',
    red: 'bg-red-100 text-red-600 border border-red-200',
    blue: 'bg-blue-100 text-blue-700 border border-blue-200',
    gray: 'bg-gray-100 text-gray-600 border border-gray-200',
    purple: 'bg-purple-100 text-winzee-dark border border-purple-200',
    lime: 'bg-winzee-lime/20 text-winzee-dark border border-winzee-lime/40',
    gold: 'bg-amber-50 text-amber-700 border border-amber-200',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
