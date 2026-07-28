import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlatformBadge } from './platform-badge'
import { formatPrice } from '@/lib/utils'
import type { Bundle } from '@prisma/client'

export function BundleCard({ bundle }: { bundle: Bundle }) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      {bundle.coverImageUrl && (
        <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
          <img
            src={bundle.coverImageUrl}
            alt={bundle.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <PlatformBadge platform={bundle.platform} />
          <span className="text-lg font-bold text-primary">{formatPrice(bundle.priceCents)}</span>
        </div>
        <CardTitle className="text-lg mt-2">{bundle.name}</CardTitle>
        <CardDescription className="line-clamp-2">{bundle.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        {bundle.previewItems.length > 0 && (
          <ul className="space-y-1">
            {bundle.previewItems.slice(0, 4).map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="text-primary">✓</span> {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/bundles/${bundle.slug}`}>View Bundle</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
