import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import { exchangeDiscordCode, getDiscordUser } from '@/lib/oauth/discord'
import { exchangeGitHubCode, getGitHubUser } from '@/lib/oauth/github'
import { exchangeSlackCode } from '@/lib/oauth/slack'
import { exchangeNotionCode } from '@/lib/oauth/notion'
import type { Platform } from '@prisma/client'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const oauthError = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const cookieStore = await cookies()
  const storedCsrf = cookieStore.get(`oauth_csrf_${platform}`)?.value

  // Parse state
  let purchaseId = ''
  let csrf = ''
  try {
    const parsed = JSON.parse(Buffer.from(stateParam ?? '', 'base64url').toString())
    purchaseId = parsed.purchaseId
    csrf = parsed.csrf
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`)
  }

  if (!storedCsrf || storedCsrf !== csrf) {
    return NextResponse.redirect(`${appUrl}/purchases/${purchaseId}/connect?error=csrf_mismatch`)
  }

  cookieStore.delete(`oauth_csrf_${platform}`)

  if (oauthError) {
    return NextResponse.redirect(`${appUrl}/purchases/${purchaseId}/connect?error=access_denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/purchases/${purchaseId}/connect?error=no_code`)
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.redirect(`${appUrl}/sign-in?redirect=/purchases/${purchaseId}/connect`)
  }

  try {
    let platformUserId: string
    let platformUsername: string | undefined
    let accessToken: string
    let scopes: string[] = []

    switch (platform) {
      case 'discord': {
        const tokens = await exchangeDiscordCode(code)
        const discordUser = await getDiscordUser(tokens.accessToken)
        platformUserId = discordUser.id
        platformUsername = `${discordUser.username}#${discordUser.discriminator}`
        accessToken = tokens.accessToken
        scopes = tokens.scope.split(' ')
        break
      }
      case 'github': {
        const tokens = await exchangeGitHubCode(code)
        const ghUser = await getGitHubUser(tokens.accessToken)
        platformUserId = String(ghUser.id)
        platformUsername = ghUser.login
        accessToken = tokens.accessToken
        scopes = tokens.scope.split(',')
        break
      }
      case 'slack': {
        const tokens = await exchangeSlackCode(code)
        platformUserId = tokens.botUserId
        platformUsername = tokens.teamName
        accessToken = tokens.accessToken
        break
      }
      case 'notion': {
        const tokens = await exchangeNotionCode(code)
        platformUserId = tokens.ownerId
        platformUsername = tokens.ownerName
        accessToken = tokens.accessToken
        break
      }
      default:
        return NextResponse.redirect(`${appUrl}/dashboard?error=unknown_platform`)
    }

    const encryptedToken = encrypt(accessToken) as unknown as Parameters<typeof prisma.platformConnection.create>[0]['data']['encryptedToken']

    await prisma.platformConnection.upsert({
      where: { userId_platform: { userId: user.id, platform: platform.toUpperCase() as Platform } },
      create: {
        userId: user.id,
        platform: platform.toUpperCase() as Platform,
        platformUserId,
        platformUsername,
        encryptedToken,
        scopes,
      },
      update: {
        platformUserId,
        platformUsername,
        encryptedToken,
        scopes,
      },
    })

    const destination = purchaseId ? `/purchases/${purchaseId}/provision` : '/account'
    return NextResponse.redirect(`${appUrl}${destination}`)
  } catch (err) {
    console.error(`OAuth callback error for ${platform}:`, err)
    const errorMsg = err instanceof Error ? encodeURIComponent(err.message) : 'oauth_failed'
    return NextResponse.redirect(`${appUrl}/purchases/${purchaseId}/connect?error=${errorMsg}`)
  }
}
