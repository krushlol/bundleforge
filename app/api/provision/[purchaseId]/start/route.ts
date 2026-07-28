import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { runProvisioningJob } from '@/lib/provisioning/executor'

export const maxDuration = 60

export async function POST(
  req: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const { purchaseId } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const purchase = await prisma.purchase.findFirst({
    where: { id: purchaseId, userId: user.id },
    include: { bundle: true },
  })
  if (!purchase) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
  if (!['PAID', 'FAILED'].includes(purchase.status)) {
    return NextResponse.json({ error: `Cannot provision purchase with status: ${purchase.status}` }, { status: 400 })
  }

  const connection = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId: user.id, platform: purchase.bundle.platform } },
  })
  if (!connection) {
    return NextResponse.json({ error: 'Platform not connected' }, { status: 400 })
  }

  const { userInputs } = await req.json().catch(() => ({ userInputs: {} }))

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { status: 'PROVISIONING', userInputs: userInputs ?? {} },
  })

  const job = await prisma.provisioningJob.create({
    data: {
      purchaseId: purchase.id,
      platform: purchase.bundle.platform,
      status: 'QUEUED',
      steps: [],
    },
  })

  // Run in background — do not await
  runProvisioningJob(job, purchase, connection).catch((err) => {
    console.error(`Provisioning job ${job.id} failed:`, err)
  })

  return NextResponse.json({ jobId: job.id })
}
