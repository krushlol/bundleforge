import type { BundleStep } from '@/types/bundle'
import type { ProvisioningContext } from '@/types/provisioning'
import { resolveValue } from '../resolver'

async function notionRequest(
  method: string,
  path: string,
  token: string,
  body?: object
): Promise<Record<string, unknown>> {
  await new Promise((r) => setTimeout(r, 350)) // 3 req/sec limit
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion API ${method} ${path} failed (${res.status}): ${text}`)
  }
  return res.json()
}

export async function executeNotionStep(
  step: BundleStep,
  ctx: ProvisioningContext
): Promise<Record<string, unknown>> {
  const cfg = resolveValue(step.config, ctx) as Record<string, unknown>
  const token = ctx.decryptedToken

  switch (step.type) {
    case 'notion.create_page': {
      const parent = cfg.parentPageId
        ? { type: 'page_id', page_id: cfg.parentPageId }
        : { type: 'workspace', workspace: true }
      const page = await notionRequest('POST', '/pages', token, {
        parent,
        properties: {
          title: {
            title: [{ type: 'text', text: { content: cfg.title } }],
          },
        },
        icon: cfg.icon ? { type: 'emoji', emoji: cfg.icon } : undefined,
      })
      return { pageId: page.id, pageUrl: page.url }
    }

    case 'notion.create_database': {
      const db = await notionRequest('POST', '/databases', token, {
        parent: { type: 'page_id', page_id: cfg.parentPageId },
        title: [{ type: 'text', text: { content: cfg.title } }],
        properties: cfg.properties ?? {
          Name: { title: {} },
          Status: {
            select: {
              options: [
                { name: 'Not started', color: 'red' },
                { name: 'In progress', color: 'yellow' },
                { name: 'Done', color: 'green' },
              ],
            },
          },
        },
      })
      return { databaseId: db.id, databaseUrl: db.url }
    }

    case 'notion.append_blocks': {
      await notionRequest('PATCH', `/blocks/${cfg.pageId}/children`, token, {
        children: cfg.blocks,
      })
      return {}
    }

    default:
      throw new Error(`Unknown Notion step type: ${step.type}`)
  }
}
