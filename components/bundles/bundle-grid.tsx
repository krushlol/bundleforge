'use client'

import { useState } from 'react'
import { BundleCard } from './bundle-card'
import { Button } from '@/components/ui/button'
import type { Bundle } from '@prisma/client'

const PLATFORMS = ['All', 'DISCORD', 'GITHUB', 'SLACK', 'NOTION']

export function BundleGrid({ bundles }: { bundles: Bundle[] }) {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? bundles : bundles.filter((b) => b.platform === active)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <Button
            key={p}
            variant={active === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActive(p)}
          >
            {p === 'All' ? 'All Platforms' : p.charAt(0) + p.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No bundles available for this platform yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BundleCard key={b.id} bundle={b} />
          ))}
        </div>
      )}
    </div>
  )
}
