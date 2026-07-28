import { OAUTH_CONFIGS } from './config'

const config = OAUTH_CONFIGS.slack

export function buildSlackAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    redirect_uri: config.callbackUrl,
    scope: config.scopes.join(','),
    state,
  })
  return `${config.authorizeUrl}?${params}`
}

export async function exchangeSlackCode(code: string): Promise<{
  accessToken: string
  botUserId: string
  teamId: string
  teamName: string
}> {
  const credentials = Buffer.from(
    `${process.env.SLACK_CLIENT_ID}:${process.env.SLACK_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: config.callbackUrl,
    }),
  })
  if (!res.ok) throw new Error(`Slack token exchange failed: ${await res.text()}`)
  const data = await res.json()
  if (!data.ok) throw new Error(data.error ?? 'Slack OAuth failed')
  return {
    accessToken: data.access_token,
    botUserId: data.bot_user_id,
    teamId: data.team.id,
    teamName: data.team.name,
  }
}
