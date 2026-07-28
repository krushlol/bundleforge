import { OAUTH_CONFIGS } from './config'

const config = OAUTH_CONFIGS.github

export function buildGitHubAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: config.callbackUrl,
    scope: config.scopes.join(' '),
    state,
  })
  return `${config.authorizeUrl}?${params}`
}

export async function exchangeGitHubCode(code: string): Promise<{
  accessToken: string
  scope: string
}> {
  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
      redirect_uri: config.callbackUrl,
    }),
  })
  if (!res.ok) throw new Error(`GitHub token exchange failed: ${await res.text()}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error_description ?? data.error)
  return { accessToken: data.access_token, scope: data.scope }
}

export async function getGitHubUser(accessToken: string): Promise<{
  id: number
  login: string
  email: string | null
}> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) throw new Error(`GitHub user fetch failed: ${await res.text()}`)
  return res.json()
}
