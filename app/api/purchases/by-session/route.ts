export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const purchase = await prisma.purchase.findFirst({
    where: {
      stripeSessionId: sessionId,
      userId: user.id,
      status: { not: 'PENDING_PAYMENT' },
    },
  })

  if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ purchaseId: purchase.id })
}
