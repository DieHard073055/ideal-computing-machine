import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-winzee-indigo">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-white border border-gray-200 text-winzee-indigo placeholder-winzee-muted/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-winzee-lime/50 focus:border-winzee-purple transition-all ${error ? 'border-red-400 focus:ring-red-200' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
