'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'polling' | 'redirecting' | 'timeout'>('polling')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      router.push('/dashboard')
      return
    }

    let attempts = 0
    const maxAttempts = 15

    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/purchases/by-session?session_id=${sessionId}`)
        if (res.ok) {
          const { purchaseId } = await res.json()
          clearInterval(interval)
          setStatus('redirecting')
          router.push(`/purchases/${purchaseId}/connect`)
        }
      } catch {}

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setStatus('timeout')
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [searchParams, router])

  return (
    <div className="container py-24 text-center space-y-4">
      {status === 'polling' && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Payment confirmed!</h1>
          <p className="text-muted-foreground">Setting things up, just a moment...</p>
        </>
      )}
      {status === 'redirecting' && (
        <>
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold">Purchase complete!</h1>
          <p className="text-muted-foreground">Redirecting you to set up your bundle...</p>
        </>
      )}
      {status === 'timeout' && (
        <>
          <div className="text-5xl">⏳</div>
          <h1 className="text-2xl font-bold">Payment received</h1>
          <p className="text-muted-foreground">
            Your purchase is confirmed. Check your dashboard to complete setup.
          </p>
          <a href="/dashboard" className="text-primary underline">Go to Dashboard</a>
        </>
      )}
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container py-24 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
