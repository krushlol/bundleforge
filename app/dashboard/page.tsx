import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PurchaseCard } from '@/components/dashboard/purchase-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — BundleForge' }

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in?redirect=/dashboard')

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    include: { bundle: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Purchases</h1>
        <Button asChild variant="outline">
          <Link href="/bundles">Browse More</Link>
        </Button>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-4">
          <p className="text-4xl">📦</p>
          <p className="font-medium">No purchases yet</p>
          <p className="text-sm">Browse our bundles and set up your first platform in seconds.</p>
          <Button asChild>
            <Link href="/bundles">Browse Bundles</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {purchases.map((p) => (
            <PurchaseCard key={p.id} purchase={p} />
          ))}
        </div>
      )}
    </div>
  )
}
