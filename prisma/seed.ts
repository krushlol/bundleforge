import { PrismaClient } from '@prisma/client'
import type { BundleDefinition } from '../types/bundle'

const prisma = new PrismaClient()

const GAMING_DISCORD_DEFINITION: BundleDefinition = {
  platform: 'discord',
  version: '1',
  templateCode: 'REPLACE_WITH_YOUR_TEMPLATE_CODE',
  inputs: [
    {
      id: 'serverName',
      label: 'What should your server be called?',
      placeholder: 'e.g., The Valorant Hub',
      required: true,
      type: 'text',
      maxLength: 100,
    },
  ],
  steps: [
    {
      id: 'create_server',
      type: 'discord.create_server_from_template',
      label: 'Creating your Discord server',
      config: { name: '{{inputs.serverName}}', templateCode: '{{bundle.templateCode}}' },
    },
    {
      id: 'add_user',
      type: 'discord.add_member',
      label: 'Adding you to the server',
      dependsOn: ['create_server'],
      config: { guildId: '{{steps.create_server.output.guildId}}', userId: '{{platform.userId}}' },
    },
    {
      id: 'transfer_ownership',
      type: 'discord.transfer_ownership',
      label: 'Transferring server ownership to you',
      dependsOn: ['add_user'],
      config: { guildId: '{{steps.create_server.output.guildId}}', newOwnerId: '{{platform.userId}}' },
    },
    {
      id: 'create_invite',
      type: 'discord.create_invite',
      label: 'Generating your invite link',
      dependsOn: ['transfer_ownership'],
      config: {
        guildId: '{{steps.create_server.output.guildId}}',
        channelId: '{{steps.create_server.output.firstChannelId}}',
      },
    },
    {
      id: 'bot_leave',
      type: 'discord.bot_leave',
      label: 'Cleaning up',
      dependsOn: ['create_invite'],
      config: { guildId: '{{steps.create_server.output.guildId}}' },
    },
  ],
}

const GITHUB_OSS_DEFINITION: BundleDefinition = {
  platform: 'github',
  version: '1',
  inputs: [
    {
      id: 'repoName',
      label: 'Repository name',
      placeholder: 'my-awesome-project',
      required: true,
      type: 'text',
      maxLength: 100,
    },
    {
      id: 'isPrivate',
      label: 'Make this repository private?',
      required: false,
      type: 'boolean',
    },
  ],
  steps: [
    {
      id: 'create_repo',
      type: 'github.create_repo',
      label: 'Creating repository',
      config: {
        name: '{{inputs.repoName}}',
        private: '{{inputs.isPrivate}}',
        description: 'Created with BundleForge',
        autoInit: true,
      },
    },
    {
      id: 'create_labels',
      type: 'github.create_labels',
      label: 'Setting up issue labels',
      dependsOn: ['create_repo'],
      config: {
        repoFullName: '{{steps.create_repo.output.fullName}}',
        labels: [
          { name: 'bug', color: 'd73a4a', description: "Something isn't working" },
          { name: 'feature', color: '0075ca', description: 'New feature or request' },
          { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
          { name: 'help wanted', color: '008672', description: 'Extra attention is needed' },
          { name: 'documentation', color: '0052cc', description: 'Improvements to docs' },
        ],
      },
    },
    {
      id: 'branch_protection',
      type: 'github.set_branch_protection',
      label: 'Configuring branch protection',
      dependsOn: ['create_repo'],
      config: {
        repoFullName: '{{steps.create_repo.output.fullName}}',
        branch: 'main',
        requirePullRequest: true,
        requireApprovals: 1,
      },
    },
  ],
}

async function main() {
  await prisma.bundle.upsert({
    where: { slug: 'gaming-community-discord' },
    create: {
      slug: 'gaming-community-discord',
      name: 'Gaming Community',
      tagline: 'A ready-to-go Discord server for gaming groups',
      description: 'Get a fully configured Discord server with organized channels for gaming, voice chats, media sharing, and moderation — all set up in seconds.',
      platform: 'DISCORD',
      priceCents: 999,
      stripePriceId: 'price_REPLACE_ME',
      tags: ['discord', 'gaming', 'community'],
      previewItems: [
        '20+ pre-built channels',
        'Organized categories (General, Gaming, Media, Admin)',
        '5 role tiers with permissions',
        'Moderation channel setup',
        'Rules and welcome channels',
      ],
      definition: GAMING_DISCORD_DEFINITION as object,
      sortOrder: 1,
    },
    update: {
      definition: GAMING_DISCORD_DEFINITION as object,
    },
  })

  await prisma.bundle.upsert({
    where: { slug: 'open-source-starter-github' },
    create: {
      slug: 'open-source-starter-github',
      name: 'Open Source Starter',
      tagline: 'A GitHub repo scaffold for open source projects',
      description: 'Launch your open source project with labels, branch protection, issue templates, and a professional README — everything configured for contribution-ready development.',
      platform: 'GITHUB',
      priceCents: 799,
      stripePriceId: 'price_REPLACE_ME_2',
      tags: ['github', 'open-source', 'development'],
      previewItems: [
        'Custom issue label set (5 labels)',
        'Branch protection on main',
        'PR review requirements',
        'Repository created with auto-init',
      ],
      definition: GITHUB_OSS_DEFINITION as object,
      sortOrder: 2,
    },
    update: {
      definition: GITHUB_OSS_DEFINITION as object,
    },
  })

  console.log('Seeded 2 bundles ✓')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
