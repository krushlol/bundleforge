import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const PLATFORM_INFO: Record<string, { name: string; icon: string; description: string; color: string }> = {
  DISCORD: {
    name: 'Discord',
    icon: '🎮',
    description: 'Connect Discord so BundleForge can create and configure your server.',
    color: 'text-indigo-600',
  },
  GITHUB: {
    name: 'GitHub',
    icon: '⚙️',
    description: 'Connect GitHub so BundleForge can create your repository.',
    color: 'text-gray-700',
  },
  SLACK: {
    name: 'Slack',
    icon: '💬',
    description: 'Connect Slack so BundleForge can set up your workspace channels.',
    color: 'text-green-600',
  },
  NOTION: {
    name: 'Notion',
    icon: '📝',
    description: 'Connect Notion so BundleForge can create your workspace pages.',
    color: 'text-orange-600',
  },
}

interface Props {
  platform: string
  purchaseId: string
  alreadyConnected?: boolean
  error?: string | null
}

export function PlatformConnectCard({ platform, purchaseId, alreadyConnected, error }: Props) {
  const info = PLATFORM_INFO[platform]
  if (!info) return null

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="text-5xl mb-2">{info.icon}</div>
        <CardTitle className={info.color}>Connect {info.name}</CardTitle>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        {alreadyConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-green-600 text-center font-medium">✓ {info.name} already connected</p>
            <Button asChild className="w-full">
              <a href={`/purchases/${purchaseId}/provision`}>Continue to Setup →</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={`/api/oauth/${platform.toLowerCase()}/authorize?purchaseId=${purchaseId}`}>
                Reconnect {info.name}
              </a>
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full" size="lg">
            <a href={`/api/oauth/${platform.toLowerCase()}/authorize?purchaseId=${purchaseId}`}>
              Connect {info.name} →
            </a>
          </Button>
        )}
        <p className="text-xs text-muted-foreground text-center">
          We only request the minimum permissions needed to set up your bundle.
        </p>
      </CardContent>
    </Card>
  )
}
