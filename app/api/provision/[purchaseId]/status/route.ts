export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const { purchaseId } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const purchase = await prisma.purchase.findFirst({
    where: { id: purchaseId, userId: user.id },
  })
  if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const job = await prisma.provisioningJob.findFirst({
    where: { purchaseId },
    orderBy: { createdAt: 'desc' },
  })

  if (!job) {
    return NextResponse.json({ status: 'NOT_STARTED', steps: [], output: null, errorMessage: null })
  }

  return NextResponse.json({
    status: job.status,
    steps: job.steps,
    output: job.output,
    errorMessage: job.errorMessage,
  })
}
