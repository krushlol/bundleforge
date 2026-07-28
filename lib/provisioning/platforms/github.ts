import type { BundleStep } from '@/types/bundle'
import type { ProvisioningContext } from '@/types/provisioning'
import { resolveValue } from '../resolver'

const GITHUB_API = 'https://api.github.com'

async function ghRequest(
  method: string,
  path: string,
  token: string,
  body?: object
): Promise<unknown> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${method} ${path} failed (${res.status}): ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function executeGitHubStep(
  step: BundleStep,
  ctx: ProvisioningContext
): Promise<Record<string, unknown>> {
  const cfg = resolveValue(step.config, ctx) as Record<string, unknown>
  const token = ctx.decryptedToken

  switch (step.type) {
    case 'github.create_repo': {
      const repo = await ghRequest('POST', '/user/repos', token, {
        name: cfg.name,
        description: cfg.description ?? '',
        private: cfg.private ?? false,
        auto_init: cfg.autoInit ?? true,
      }) as { full_name: string; html_url: string; default_branch: string }
      return { fullName: repo.full_name, htmlUrl: repo.html_url, defaultBranch: repo.default_branch }
    }

    case 'github.create_labels': {
      const labels = cfg.labels as Array<{ name: string; color: string; description: string }>
      for (const label of labels) {
        try { await ghRequest('POST', `/repos/${cfg.repoFullName}/labels`, token, label) }
        catch { /* label may already exist */ }
      }
      return {}
    }

    case 'github.create_files': {
      const files = cfg.files as Array<{ path: string; content: string }>
      const login = ctx.platformUserId
      for (const file of files) {
        const encoded = Buffer.from(file.content).toString('base64')
        await ghRequest('PUT', `/repos/${login}/${(cfg.repoFullName as string).split('/')[1]}/contents/${file.path}`, token, {
          message: `chore: add ${file.path}`,
          content: encoded,
        })
      }
      return {}
    }

    case 'github.set_branch_protection': {
      await ghRequest(
        'PUT',
        `/repos/${cfg.repoFullName}/branches/${cfg.branch ?? 'main'}/protection`,
        token,
        {
          required_pull_request_reviews: cfg.requirePullRequest
            ? { required_approving_review_count: cfg.requireApprovals ?? 1 }
            : null,
          enforce_admins: false,
          restrictions: null,
          required_status_checks: null,
        }
      )
      return {}
    }

    default:
      throw new Error(`Unknown GitHub step type: ${step.type}`)
  }
}
