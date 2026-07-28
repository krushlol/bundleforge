import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlatformBadge } from '@/components/bundles/platform-badge'
import { formatPrice } from '@/lib/utils'
import type { Purchase, Bundle } from '@prisma/client'

type PurchaseWithBundle = Purchase & { bundle: Bundle }

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROVISIONING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Payment pending',
  PAID: 'Ready to set up',
  PROVISIONING: 'Setting up...',
  COMPLETED: 'Complete',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

export function PurchaseCard({ purchase }: { purchase: PurchaseWithBundle }) {
  const label = STATUS_LABELS[purchase.status] ?? purchase.status

  function getAction() {
    if (purchase.status === 'PAID') return { href: `/purchases/${purchase.id}/connect`, label: 'Connect & Set Up' }
    if (purchase.status === 'PROVISIONING') return { href: `/purchases/${purchase.id}/provision`, label: 'View Progress' }
    if (purchase.status === 'COMPLETED') return { href: `/purchases/${purchase.id}`, label: 'View Results' }
    if (purchase.status === 'FAILED') return { href: `/purchases/${purchase.id}/provision`, label: 'Retry' }
    return null
  }

  const action = getAction()

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <PlatformBadge platform={purchase.bundle.platform} />
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[purchase.status]}`}>
            {label}
          </span>
        </div>
        <CardTitle className="text-base">{purchase.bundle.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          {formatPrice(purchase.amountPaidCents)} · {new Date(purchase.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      {action && (
        <CardFooter>
          <Button asChild size="sm" variant={purchase.status === 'COMPLETED' ? 'outline' : 'default'}>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
