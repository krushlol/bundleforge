import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlatformConnectCard } from '@/components/purchase/platform-connect-card'

export default async function ConnectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const user = await getCurrentUser()
  if (!user) redirect(`/sign-in?redirect=/purchases/${id}/connect`)

  const purchase = await prisma.purchase.findFirst({
    where: { id, userId: user.id },
    include: { bundle: true },
  })
  if (!purchase) notFound()

  if (purchase.status === 'COMPLETED') {
    redirect(`/purchases/${id}`)
  }

  const connection = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId: user.id, platform: purchase.bundle.platform } },
  })

  return (
    <div className="container py-16">
      <div className="max-w-sm mx-auto mb-8 text-center">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
          {purchase.bundle.name}
        </p>
        <h1 className="text-2xl font-bold mt-1">Step 1: Connect your account</h1>
      </div>
      <PlatformConnectCard
        platform={purchase.bundle.platform}
        purchaseId={id}
        alreadyConnected={!!connection}
        error={error === 'access_denied' ? 'Authorization was denied. Please try again.' : error ?? null}
      />
    </div>
  )
}
