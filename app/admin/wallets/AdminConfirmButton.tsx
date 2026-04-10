'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function AdminConfirmButton({ ticketId }: { ticketId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await fetch(`/api/admin/payments/${ticketId}/confirm`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" onClick={handleConfirm} loading={loading} className="text-xs px-3 py-1">
      Confirm
    </Button>
  )
}
