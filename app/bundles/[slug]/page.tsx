import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformBadge } from '@/components/bundles/platform-badge'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bundle = await prisma.bundle.findUnique({ where: { slug } })
  if (!bundle) return {}
  return { title: `${bundle.name} — BundleForge` }
}

export default async function BundleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bundle = await prisma.bundle.findUnique({ where: { slug, isActive: true } })
  if (!bundle) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container py-12 max-w-4xl">
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <PlatformBadge platform={bundle.platform} />
            <h1 className="text-3xl font-bold mt-3">{bundle.name}</h1>
            <p className="text-lg text-muted-foreground mt-2">{bundle.tagline}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">What&apos;s included</h2>
            <ul className="space-y-2">
              {bundle.previewItems.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="text-primary font-bold">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {bundle.description && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {bundle.description}
              </p>
            </div>
          )}

          {bundle.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bundle.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-xl p-6 space-y-4 bg-card">
            <div className="text-3xl font-bold text-primary">{formatPrice(bundle.priceCents)}</div>
            <p className="text-sm text-muted-foreground">One-time purchase · Instant setup</p>

            {user ? (
              <form action="/api/stripe/checkout" method="POST">
                <input type="hidden" name="bundleId" value={bundle.id} />
                <Button type="submit" size="lg" className="w-full">
                  Buy Now →
                </Button>
              </form>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link href={`/sign-in?redirect=/bundles/${bundle.slug}`}>
                  Sign in to Buy
                </Link>
              </Button>
            )}

            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>✓ Instant provisioning after purchase</li>
              <li>✓ Secure OAuth — we never store passwords</li>
              <li>✓ You retain full ownership</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
