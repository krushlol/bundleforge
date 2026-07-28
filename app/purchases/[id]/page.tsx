import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { PlatformBadge } from '@/components/bundles/platform-badge'
import type { JobOutput } from '@/types/provisioning'

export default async function PurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/sign-in?redirect=/purchases/${id}`)

  const purchase = await prisma.purchase.findFirst({
    where: { id, userId: user.id },
    include: {
      bundle: true,
      provisioningJobs: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  if (!purchase) notFound()

  if (purchase.status !== 'COMPLETED') redirect(`/purchases/${id}/provision`)

  const job = purchase.provisioningJobs[0]
  const output = job?.output as JobOutput | null

  return (
    <div className="container py-16 max-w-lg mx-auto text-center space-y-6">
      <div className="text-5xl">🎉</div>
      <div>
        <PlatformBadge platform={purchase.bundle.platform} />
        <h1 className="text-2xl font-bold mt-3">{purchase.bundle.name} is ready!</h1>
        <p className="text-muted-foreground mt-1">Your setup was completed successfully.</p>
      </div>

      {output?.primaryUrl && (
        <Button asChild size="lg" className="w-full">
          <a href={output.primaryUrl} target="_blank" rel="noopener noreferrer">
            {output.primaryLabel ?? 'Open'} →
          </a>
        </Button>
      )}

      <Button asChild variant="outline">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
