import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { PlatformBadge } from '@/components/bundles/platform-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarUpload } from '@/components/account/avatar-upload'

export const metadata = { title: 'Account — BundleForge' }

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in?redirect=/account')

  const connections = await prisma.platformConnection.findMany({
    where: { userId: user.id },
    orderBy: { platform: 'asc' },
  })

  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-bold mb-8">Account</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <AvatarUpload currentUrl={user.avatarUrl ?? null} />
          <p className="text-muted-foreground">{user.email}</p>
          <form action="/api/auth/sign-out" method="POST">
            <Button type="submit" variant="outline" size="sm">Sign out</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No platforms connected yet. They&apos;ll appear here after you connect during a bundle setup.</p>
          ) : (
            <ul className="space-y-3">
              {connections.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={c.platform} />
                    {c.platformUsername && (
                      <span className="text-sm text-muted-foreground">{c.platformUsername}</span>
                    )}
                  </div>
                  <form action={`/api/connections/${c.id}/disconnect`} method="POST">
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      Disconnect
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
