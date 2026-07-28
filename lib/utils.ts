import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function platformLabel(platform: string): string {
  const labels: Record<string, string> = {
    DISCORD: 'Discord',
    NOTION: 'Notion',
    GITHUB: 'GitHub',
    SLACK: 'Slack',
  }
  return labels[platform] ?? platform
}
