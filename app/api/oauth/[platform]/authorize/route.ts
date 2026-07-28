export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { buildDiscordAuthUrl } from '@/lib/oauth/discord'
import { buildGitHubAuthUrl } from '@/lib/oauth/github'
import { buildSlackAuthUrl } from '@/lib/oauth/slack'
import { buildNotionAuthUrl } from '@/lib/oauth/notion'
import { randomBytes } from 'crypto'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { platform } = await params
  const { searchParams } = new URL(req.url)
  const purchaseId = searchParams.get('purchaseId') ?? ''

  const csrf = randomBytes(16).toString('hex')
  const state = Buffer.from(JSON.stringify({ purchaseId, csrf })).toString('base64url')

  const cookieStore = await cookies()
  cookieStore.set(`oauth_csrf_${platform}`, csrf, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  let url: string
  switch (platform) {
    case 'discord': url = buildDiscordAuthUrl(state); break
    case 'github':  url = buildGitHubAuthUrl(state); break
    case 'slack':   url = buildSlackAuthUrl(state); break
    case 'notion':  url = buildNotionAuthUrl(state); break
    default: return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
  }

  return NextResponse.redirect(url)
}
