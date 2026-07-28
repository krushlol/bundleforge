import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProvisionForm } from '@/components/purchase/provision-form'
import { ProvisioningProgress } from '@/components/purchase/provisioning-progress'
import type { BundleDefinition } from '@/types/bundle'

export default async function ProvisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/sign-in?redirect=/purchases/${id}/provision`)

  const purchase = await prisma.purchase.findFirst({
    where: { id, userId: user.id },
    include: { bundle: true, provisioningJobs: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (!purchase) notFound()

  if (purchase.status === 'COMPLETED') redirect(`/purchases/${id}`)

  const connection = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId: user.id, platform: purchase.bundle.platform } },
  })
  if (!connection) redirect(`/purchases/${id}/connect`)

  const definition = purchase.bundle.definition as unknown as BundleDefinition
  const activeJob = purchase.provisioningJobs[0]
  const isRunning = activeJob && ['QUEUED', 'IN_PROGRESS'].includes(activeJob.status)

  return (
    <div className="container py-16">
      <div className="max-w-sm mx-auto mb-8 text-center">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
          {purchase.bundle.name}
        </p>
        <h1 className="text-2xl font-bold mt-1">Step 2: Set up your bundle</h1>
      </div>

      {isRunning ? (
        <div className="max-w-md mx-auto">
          <ProvisioningProgress purchaseId={id} />
        </div>
      ) : (
        <ProvisionForm
          purchaseId={id}
          inputs={definition.inputs ?? []}
          bundleName={purchase.bundle.name}
          platform={purchase.bundle.platform}
        />
      )}
    </div>
  )
}
