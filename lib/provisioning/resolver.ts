import type { ProvisioningContext } from '@/types/provisioning'

/**
 * Resolves template variables in a config value.
 * Supports: {{inputs.x}}, {{steps.x.output.y}}, {{platform.userId}}, {{bundle.templateCode}}
 */
export function resolveValue(value: unknown, ctx: ProvisioningContext): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => {
      const parts = path.trim().split('.')
      const resolved = getNestedValue(buildLookup(ctx), parts)
      return resolved !== undefined ? String(resolved) : `{{${path}}}`
    })
  }
  if (Array.isArray(value)) return value.map((v) => resolveValue(v, ctx))
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, resolveValue(v, ctx)])
    )
  }
  return value
}

function buildLookup(ctx: ProvisioningContext) {
  return {
    inputs: ctx.inputs,
    steps: Object.fromEntries(
      Object.entries(ctx.stepOutputs).map(([id, output]) => [id, { output }])
    ),
    platform: { userId: ctx.platformUserId },
    bundle: ctx.bundle,
  }
}

function getNestedValue(obj: Record<string, unknown>, parts: string[]): unknown {
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}
