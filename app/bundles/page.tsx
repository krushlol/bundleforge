import { prisma } from '@/lib/prisma'
import { BundleGrid } from '@/components/bundles/bundle-grid'

export const metadata = { title: 'Browse Bundles — BundleForge' }

export default async function BundlesPage() {
  let bundles: import('@prisma/client').Bundle[] = []
  try {
    bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: [{ platform: 'asc' }, { sortOrder: 'asc' }],
    })
  } catch {
    // DB not yet connected
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Bundles</h1>
        <p className="text-muted-foreground mt-1">
          Ready-made setups for your favourite platforms. Buy once, configured instantly.
        </p>
      </div>
      <BundleGrid bundles={bundles} />
    </div>
  )
}
