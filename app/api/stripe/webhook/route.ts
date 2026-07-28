import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { purchaseRecordId } = session.metadata ?? {}
    if (!purchaseRecordId) return NextResponse.json({ received: true })

    await prisma.purchase.update({
      where: { id: purchaseRecordId },
      data: {
        status: 'PAID',
        stripePaymentIntentId: session.payment_intent as string | null,
        amountPaidCents: session.amount_total ?? 0,
      },
    })
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    if (charge.payment_intent) {
      await prisma.purchase.updateMany({
        where: { stripePaymentIntentId: charge.payment_intent as string },
        data: { status: 'REFUNDED' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
