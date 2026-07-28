import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import type { BundleDefinition } from '@/types/bundle'
import type { EncryptedPayload } from '@/lib/encryption'
import type { StepResult, ProvisioningContext, JobOutput } from '@/types/provisioning'
import type { Bundle, Purchase, PlatformConnection, ProvisioningJob } from '@prisma/client'
import { executeDiscordStep } from './platforms/discord'
import { executeGitHubStep } from './platforms/github'
import { executeSlackStep } from './platforms/slack'
import { executeNotionStep } from './platforms/notion'

type FullPurchase = Purchase & { bundle: Bundle }

export async function runProvisioningJob(
  job: ProvisioningJob,
  purchase: FullPurchase,
  connection: PlatformConnection
): Promise<void> {
  const definition = purchase.bundle.definition as unknown as BundleDefinition
  const decryptedToken = decrypt(connection.encryptedToken as unknown as EncryptedPayload)

  await prisma.provisioningJob.update({
    where: { id: job.id },
    data: { status: 'IN_PROGRESS', startedAt: new Date() },
  })

  const stepResults: StepResult[] = []
  const ctx: ProvisioningContext = {
    decryptedToken,
    platformUserId: connection.platformUserId,
    inputs: (purchase.userInputs as Record<string, string | boolean>) ?? {},
    bundle: definition,
    stepOutputs: {},
  }

  for (const step of definition.steps) {
    const depsMet = (step.dependsOn ?? []).every(
      (depId) => stepResults.find((r) => r.id === depId)?.status === 'completed'
    )
    if (!depsMet) continue

    const result: StepResult = { id: step.id, label: step.label, status: 'running' }
    stepResults.push(result)
    await prisma.provisioningJob.update({
      where: { id: job.id },
      data: { steps: stepResults as object[] },
    })

    try {
      const output = await executeStep(step, ctx)
      ctx.stepOutputs[step.id] = output
      result.status = 'completed'
      result.output = output
    } catch (err) {
      result.status = 'failed'
      result.errorMessage = err instanceof Error ? err.message : String(err)
      await prisma.provisioningJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          steps: stepResults as object[],
          errorMessage: result.errorMessage,
          completedAt: new Date(),
        },
      })
      await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'FAILED' } })
      return
    }

    await prisma.provisioningJob.update({
      where: { id: job.id },
      data: { steps: stepResults as object[] },
    })
  }

  const output = buildOutput(definition, stepResults, ctx)
  await prisma.provisioningJob.update({
    where: { id: job.id },
    data: { status: 'COMPLETED', steps: stepResults as object[], output: output as object, completedAt: new Date() },
  })
  await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'COMPLETED' } })
}

async function executeStep(
  step: import('@/types/bundle').BundleStep,
  ctx: ProvisioningContext
): Promise<Record<string, unknown>> {
  const platform = ctx.bundle.platform
  if (platform === 'discord') return executeDiscordStep(step, ctx)
  if (platform === 'github') return executeGitHubStep(step, ctx)
  if (platform === 'slack') return executeSlackStep(step, ctx)
  if (platform === 'notion') return executeNotionStep(step, ctx)
  throw new Error(`Unknown platform: ${platform}`)
}

function buildOutput(
  definition: BundleDefinition,
  results: StepResult[],
  ctx: ProvisioningContext
): JobOutput {
  if (definition.platform === 'discord') {
    const invite = results.find((r) => r.id === 'create_invite')
    return {
      primaryUrl: invite?.output?.inviteUrl as string | undefined,
      primaryLabel: 'Join Your Server',
    }
  }
  if (definition.platform === 'github') {
    const repo = results.find((r) => r.id === 'create_repo')
    return {
      primaryUrl: repo?.output?.htmlUrl as string | undefined,
      primaryLabel: 'View Repository',
    }
  }
  if (definition.platform === 'slack') {
    return { primaryLabel: 'Open Slack', primaryUrl: `https://slack.com/app_redirect?channel=${ctx.stepOutputs['create_channel']?.channelId}` }
  }
  if (definition.platform === 'notion') {
    const page = results.find((r) => r.output?.pageUrl)
    return {
      primaryUrl: page?.output?.pageUrl as string | undefined,
      primaryLabel: 'Open in Notion',
    }
  }
  return {}
}
