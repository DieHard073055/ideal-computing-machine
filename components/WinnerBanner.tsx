import React from 'react'

interface WinnerBannerProps {
  ticketNumber: string
  userName: string
}

export function WinnerBanner({ ticketNumber, userName }: WinnerBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 text-center bg-gradient-to-r from-winzee-purple via-winzee-purple2 to-winzee-purple shadow-winzee-lg border border-winzee-purple/20">
      {/* Confetti dots */}
      <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-winzee-lime opacity-80" />
      <div className="absolute top-4 right-8 w-3 h-3 rounded-full bg-winzee-gold opacity-70" />
      <div className="absolute bottom-3 left-12 w-2 h-2 rounded-full bg-winzee-lime opacity-60" />
      <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-winzee-gold opacity-80" />

      <div className="text-4xl mb-3">🎉</div>
      <h2 className="text-xl font-bold text-white font-display mb-1">Winner Announced!</h2>
      <p className="text-winzee-lime font-semibold text-lg">{userName}</p>
      <p className="font-mono text-white/80 mt-1 text-sm">{ticketNumber}</p>
      <p className="text-white/70 text-sm mt-2">Congratulations to the lucky winner!</p>
    </div>
  )
}
