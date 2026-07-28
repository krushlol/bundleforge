import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PLATFORM_STYLES: Record<string, string> = {
  DISCORD: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  GITHUB: 'bg-gray-100 text-gray-700 border-gray-200',
  SLACK: 'bg-green-100 text-green-700 border-green-200',
  NOTION: 'bg-orange-100 text-orange-700 border-orange-200',
}

const PLATFORM_ICONS: Record<string, string> = {
  DISCORD: '🎮',
  GITHUB: '⚙️',
  SLACK: '💬',
  NOTION: '📝',
}

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', PLATFORM_STYLES[platform] ?? 'bg-muted text-muted-foreground')}
    >
      {PLATFORM_ICONS[platform]} {platform.charAt(0) + platform.slice(1).toLowerCase()}
    </Badge>
  )
}
