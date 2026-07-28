import type { Platform } from '@/types/bundle'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface OAuthConfig {
  authorizeUrl: string
  tokenUrl: string
  scopes: string[]
  callbackUrl: string
}

export const OAUTH_CONFIGS: Record<Lowercase<Platform>, OAuthConfig> = {
  discord: {
    authorizeUrl: 'https://discord.com/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scopes: ['identify', 'guilds.join'],
    callbackUrl: `${BASE_URL}/api/oauth/discord/callback`,
  },
  github: {
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['repo', 'workflow', 'read:user', 'user:email'],
    callbackUrl: `${BASE_URL}/api/oauth/github/callback`,
  },
  slack: {
    authorizeUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: ['channels:manage', 'chat:write', 'pins:write', 'users:read', 'team:read'],
    callbackUrl: `${BASE_URL}/api/oauth/slack/callback`,
  },
  notion: {
    authorizeUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: [],
    callbackUrl: `${BASE_URL}/api/oauth/notion/callback`,
  },
}
