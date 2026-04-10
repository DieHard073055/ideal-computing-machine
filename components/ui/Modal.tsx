'use client'

import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-winzee-indigo/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-winzee-lg border border-gray-100 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-winzee-indigo font-display">{title}</h2>
          <button
            onClick={onClose}
            className="text-winzee-muted hover:text-winzee-indigo transition-colors rounded-full p-1 hover:bg-winzee-bg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
