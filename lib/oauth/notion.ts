import { OAUTH_CONFIGS } from './config'

const config = OAUTH_CONFIGS.notion

export function buildNotionAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID!,
    redirect_uri: config.callbackUrl,
    response_type: 'code',
    owner: 'user',
    state,
  })
  return `${config.authorizeUrl}?${params}`
}

export async function exchangeNotionCode(code: string): Promise<{
  accessToken: string
  botId: string
  workspaceId: string
  workspaceName: string
  ownerId: string
  ownerName: string
}> {
  const credentials = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.callbackUrl,
    }),
  })
  if (!res.ok) throw new Error(`Notion token exchange failed: ${await res.text()}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    botId: data.bot_id,
    workspaceId: data.workspace_id,
    workspaceName: data.workspace_name,
    ownerId: data.owner?.user?.id ?? '',
    ownerName: data.owner?.user?.name ?? '',
  }
}
