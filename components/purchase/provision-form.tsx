'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProvisioningProgress } from './provisioning-progress'
import type { BundleInput } from '@/types/bundle'

interface Props {
  purchaseId: string
  inputs: BundleInput[]
  bundleName: string
  platform: string
}

export function ProvisionForm({ purchaseId, inputs, bundleName, platform }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    for (const input of inputs) {
      if (input.required && !values[input.id]) {
        setError(`"${input.label}" is required.`)
        return
      }
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/provision/${purchaseId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInputs: values }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to start provisioning')
      }
      setStarted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (started) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Setting up {bundleName}...</h2>
        <ProvisioningProgress purchaseId={purchaseId} />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configure your bundle</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Customize a few details before we set everything up.
        </p>
      </div>

      {inputs.length > 0 && (
        <div className="space-y-4">
          {inputs.map((input) => (
            <div key={input.id} className="space-y-1.5">
              <Label htmlFor={input.id}>
                {input.label}
                {input.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input
                id={input.id}
                type={input.type === 'url' ? 'url' : 'text'}
                placeholder={input.placeholder}
                maxLength={input.maxLength}
                value={values[input.id] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [input.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleStart} disabled={loading} className="w-full" size="lg">
        {loading ? 'Starting...' : `Set Up My ${platform.charAt(0) + platform.slice(1).toLowerCase()} Bundle`}
      </Button>
    </div>
  )
}
