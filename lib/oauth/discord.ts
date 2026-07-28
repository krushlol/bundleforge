import { OAUTH_CONFIGS } from './config'

const config = OAUTH_CONFIGS.discord

export function buildDiscordAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: config.callbackUrl,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  })
  return `${config.authorizeUrl}?${params}`
}

export async function exchangeDiscordCode(code: string): Promise<{
  accessToken: string
  tokenType: string
  scope: string
}> {
  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.callbackUrl,
    }),
  })
  if (!res.ok) throw new Error(`Discord token exchange failed: ${await res.text()}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    scope: data.scope,
  }
}

export async function getDiscordUser(accessToken: string): Promise<{
  id: string
  username: string
  discriminator: string
}> {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Discord user fetch failed: ${await res.text()}`)
  return res.json()
}
