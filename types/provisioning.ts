import type { BundleDefinition } from './bundle'

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface StepResult {
  id: string
  label: string
  status: StepStatus
  output?: Record<string, unknown>
  errorMessage?: string
}

export interface ProvisioningContext {
  decryptedToken: string
  platformUserId: string
  inputs: Record<string, string | boolean>
  bundle: BundleDefinition
  stepOutputs: Record<string, Record<string, unknown>>
}

export interface JobOutput {
  primaryUrl?: string
  primaryLabel?: string
  details?: Record<string, string>
}

export interface ProvisioningStatusResponse {
  status: string
  steps: StepResult[]
  output: JobOutput | null
  errorMessage: string | null
}
