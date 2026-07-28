import type { BundleStep } from '@/types/bundle'
import type { ProvisioningContext } from '@/types/provisioning'
import { resolveValue } from '../resolver'

const DISCORD_API = 'https://discord.com/api/v10'

async function discordRequest(
  method: string,
  path: string,
  token: string,
  body?: object
): Promise<unknown> {
  const isBot = token.startsWith('Bot ')
  const res = await fetch(`${DISCORD_API}${path}`, {
    method,
    headers: {
      Authorization: isBot ? token : `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Discord API ${method} ${path} failed (${res.status}): ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function executeDiscordStep(
  step: BundleStep,
  ctx: ProvisioningContext
): Promise<Record<string, unknown>> {
  const cfg = resolveValue(step.config, ctx) as Record<string, unknown>
  const botToken = process.env.DISCORD_BOT_TOKEN!
  const userToken = ctx.decryptedToken

  switch (step.type) {
    case 'discord.create_server': {
      // cfg.channels: array of {id, name, type, parent_id?} — local IDs are just placeholders
      // cfg.roles: array of {id, name, color?}
      // cfg.system_channel_id: local channel id to use as system channel
      const guild = await discordRequest(
        'POST',
        '/guilds',
        `Bot ${botToken}`,
        {
          name: cfg.name,
          channels: cfg.channels,
          roles: cfg.roles,
          system_channel_id: cfg.system_channel_id,
        }
      ) as { id: string; channels: Array<{ id: string; type: number; name: string }> }
      const generalChannel = guild.channels.find((c) => c.type === 0 && c.name === 'general')
        ?? guild.channels.find((c) => c.type === 0)
      return { guildId: guild.id, generalChannelId: generalChannel?.id }
    }

    case 'discord.create_server_from_template': {
      const guild = await discordRequest(
        'POST',
        `/guilds/templates/${cfg.templateCode}`,
        botToken,
        { name: cfg.name }
      ) as { id: string; channels: Array<{ id: string; type: number }> }
      const textChannel = guild.channels.find((c) => c.type === 0)
      return { guildId: guild.id, firstChannelId: textChannel?.id }
    }

    case 'discord.add_member': {
      await discordRequest(
        'PUT',
        `/guilds/${cfg.guildId}/members/${cfg.userId}`,
        botToken,
        { access_token: userToken }
      )
      return {}
    }

    case 'discord.transfer_ownership': {
      await discordRequest(
        'PATCH',
        `/guilds/${cfg.guildId}`,
        botToken,
        { owner_id: cfg.newOwnerId }
      )
      return {}
    }

    case 'discord.create_invite': {
      const invite = await discordRequest(
        'POST',
        `/channels/${cfg.channelId ?? cfg.guildId}/invites`,
        botToken,
        { max_age: 0, max_uses: 0, unique: true }
      ) as { code: string }
      return { inviteUrl: `https://discord.gg/${invite.code}`, inviteCode: invite.code }
    }

    case 'discord.bot_leave': {
      await discordRequest('DELETE', `/users/@me/guilds/${cfg.guildId}`, botToken)
      return {}
    }

    default:
      throw new Error(`Unknown Discord step type: ${step.type}`)
  }
}
