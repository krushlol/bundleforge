import type { BundleStep } from '@/types/bundle'
import type { ProvisioningContext } from '@/types/provisioning'
import { resolveValue } from '../resolver'

async function slackCall(method: string, token: string, body: object): Promise<Record<string, unknown>> {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json() as Record<string, unknown>
  if (!data.ok) throw new Error(`Slack ${method} failed: ${data.error}`)
  return data
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function executeSlackStep(
  step: BundleStep,
  ctx: ProvisioningContext
): Promise<Record<string, unknown>> {
  const cfg = resolveValue(step.config, ctx) as Record<string, unknown>
  const token = ctx.decryptedToken

  switch (step.type) {
    case 'slack.create_channel': {
      await sleep(1000) // stay within Tier 2 rate limit
      const data = await slackCall('conversations.create', token, {
        name: cfg.name,
        is_private: cfg.isPrivate ?? false,
      })
      const channel = data.channel as { id: string; name: string }
      return { channelId: channel.id, channelName: channel.name }
    }

    case 'slack.set_topic': {
      await slackCall('conversations.setTopic', token, {
        channel: cfg.channelId,
        topic: cfg.topic,
      })
      return {}
    }

    case 'slack.set_purpose': {
      await slackCall('conversations.setPurpose', token, {
        channel: cfg.channelId,
        purpose: cfg.purpose,
      })
      return {}
    }

    case 'slack.post_message': {
      const data = await slackCall('chat.postMessage', token, {
        channel: cfg.channelId,
        text: cfg.text,
      })
      return { ts: (data.message as { ts: string }).ts }
    }

    case 'slack.pin_message': {
      await slackCall('pins.add', token, {
        channel: cfg.channelId,
        timestamp: cfg.ts,
      })
      return {}
    }

    case 'slack.invite_member': {
      await slackCall('conversations.invite', token, {
        channel: cfg.channelId,
        users: cfg.userId,
      })
      return {}
    }

    default:
      throw new Error(`Unknown Slack step type: ${step.type}`)
  }
}
