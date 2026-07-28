import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let bundleId: string | undefined
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await req.json()
    bundleId = body.bundleId
  } else {
    const data = await req.formData()
    bundleId = data.get('bundleId')?.toString()
  }

  if (!bundleId) return NextResponse.json({ error: 'bundleId required' }, { status: 400 })

  const bundle = await prisma.bundle.findUnique({ where: { id: bundleId, isActive: true } })
  if (!bundle) return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const purchase = await prisma.purchase.create({
    data: {
      userId: user.id,
      bundleId: bundle.id,
      stripeSessionId: 'pending',
      amountPaidCents: bundle.priceCents,
      status: 'PENDING_PAYMENT',
    },
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: bundle.stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    metadata: {
      userId: user.id,
      bundleId: bundle.id,
      purchaseRecordId: purchase.id,
    },
  })

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { stripeSessionId: session.id },
  })

  return NextResponse.redirect(session.url!, 303)
}
