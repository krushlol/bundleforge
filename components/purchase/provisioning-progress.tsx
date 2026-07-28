'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProvisioningStatusResponse, StepResult } from '@/types/provisioning'

function StepIcon({ status }: { status: StepResult['status'] }) {
  if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
  if (status === 'running') return <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
  if (status === 'failed') return <XCircle className="h-5 w-5 text-destructive shrink-0" />
  return <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
}

export function ProvisioningProgress({ purchaseId }: { purchaseId: string }) {
  const [data, setData] = useState<ProvisioningStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stopped = false

    async function poll() {
      while (!stopped) {
        try {
          const res = await fetch(`/api/provision/${purchaseId}/status`)
          if (res.ok) {
            const json: ProvisioningStatusResponse = await res.json()
            setData(json)
            if (json.status === 'COMPLETED' || json.status === 'FAILED') break
          }
        } catch {
          setError('Lost connection — retrying...')
        }
        await new Promise((r) => setTimeout(r, 2000))
      }
    }

    poll()
    return () => { stopped = true }
  }, [purchaseId])

  if (!data) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Starting provisioning...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {data.steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3">
            <StepIcon status={step.status} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{step.label}</p>
              {step.errorMessage && (
                <p className="text-xs text-destructive mt-0.5">{step.errorMessage}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {data.status === 'COMPLETED' && data.output?.primaryUrl && (
        <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm font-medium text-green-800 mb-3">All done! Your setup is ready.</p>
          <Button asChild className="w-full">
            <a href={data.output.primaryUrl} target="_blank" rel="noopener noreferrer">
              {data.output.primaryLabel ?? 'Open'}
            </a>
          </Button>
        </div>
      )}

      {data.status === 'FAILED' && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-800">Provisioning failed</p>
          {data.errorMessage && <p className="text-xs text-red-600 mt-1">{data.errorMessage}</p>}
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              fetch(`/api/provision/${purchaseId}/start`, { method: 'POST' })
              setData(null)
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-muted-foreground">{error}</p>}
    </div>
  )
}
