import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BundleCard } from '@/components/bundles/bundle-card'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  let featuredBundles: import('@prisma/client').Bundle[] = []
  let isLoggedIn = false
  try {
    featuredBundles = await prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 3,
    })
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    isLoggedIn = !!data.user
  } catch {
    // DB not yet connected — show landing without bundles
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground bg-muted mb-2">
          <span className="text-primary">⚡</span> Instant platform setup
        </div>
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-tight">
          Your platform. Set up in seconds.
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Buy a bundle, connect your account, and BundleForge builds your Discord server, GitHub repo, Slack workspace, or Notion workspace — fully configured.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/bundles">Browse Bundles</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={isLoggedIn ? '/dashboard' : '/sign-up'}>
              {isLoggedIn ? 'Go to dashboard' : 'Get started free'}
            </Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="container py-16">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { step: '1', title: 'Pick a bundle', desc: 'Choose from curated Discord, GitHub, Slack, and Notion setups.' },
              { step: '2', title: 'Connect your account', desc: 'Securely connect the platform with one click — we only request what we need.' },
              { step: '3', title: 'Done in seconds', desc: 'BundleForge builds everything for you. Walk away with a fully configured setup.' },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-4">Supported platforms</h2>
        <p className="text-muted-foreground text-center mb-10">
          More platforms coming soon.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { icon: '🎮', name: 'Discord', desc: 'Channels, roles & categories' },
            { icon: '⚙️', name: 'GitHub', desc: 'Repos, labels & workflows' },
            { icon: '💬', name: 'Slack', desc: 'Channels & workspace setup' },
            { icon: '📝', name: 'Notion', desc: 'Pages & database templates' },
          ].map((p) => (
            <div key={p.name} className="flex flex-col items-center text-center p-4 rounded-lg border bg-card space-y-1.5">
              <span className="text-3xl">{p.icon}</span>
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured bundles */}
      {featuredBundles.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="container py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured bundles</h2>
              <Button asChild variant="outline">
                <Link href="/bundles">View all →</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBundles.map((b) => (
                <BundleCard key={b.id} bundle={b} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
