'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  const variants = {
    primary: 'bg-gradient-to-r from-winzee-purple to-winzee-purple2 text-white shadow-winzee hover:shadow-winzee-lg active:scale-[0.98]',
    secondary: 'bg-transparent border-2 border-winzee-lime text-winzee-indigo hover:bg-winzee-lime/10 active:scale-[0.98]',
    danger: 'bg-red-500 hover:bg-red-600 text-white active:scale-[0.98]',
    ghost: 'bg-transparent text-winzee-muted hover:text-winzee-indigo hover:bg-winzee-bg',
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-pill font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-3 focus-visible:ring-winzee-lime/60 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
