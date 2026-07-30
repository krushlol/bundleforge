import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function Navbar() {
  let user = null
  let avatarUrl: string | null = null
  let initials = ''
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) {
      const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { avatarUrl: true, email: true } })
      avatarUrl = dbUser?.avatarUrl ?? null
      initials = (dbUser?.email?.[0] ?? '?').toUpperCase()
    }
  } catch {
    // Supabase not configured yet
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">⚡</span> BundleForge
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/bundles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Browse
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/account" className="relative w-8 h-8 rounded-full overflow-hidden border border-border hover:opacity-80 transition-opacity flex-shrink-0 block bg-muted">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">{initials}</span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
