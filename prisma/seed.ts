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

const COMMUNITY_DISCORD_DEFINITION: BundleDefinition = {
  platform: 'discord',
  version: '1',
  inputs: [
    {
      id: 'serverName',
      label: 'What should your server be called?',
      placeholder: 'e.g., The Coding Den',
      required: true,
      type: 'text',
      maxLength: 100,
    },
  ],
  steps: [
    {
      id: 'create_server',
      type: 'discord.create_server',
      label: 'Building your Discord server',
      config: {
        name: '{{inputs.serverName}}',
        system_channel_id: '3',
        roles: [
          { id: '0', name: '@everyone' },
          { id: '1', name: 'Moderator', color: 3066993, hoist: true },
          { id: '2', name: 'Member', color: 3447003 },
        ],
        channels: [
          // WELCOME category
          { id: '1', name: 'WELCOME', type: 4, position: 0 },
          { id: '2', name: 'rules', type: 0, parent_id: '1', position: 0 },
          { id: '3', name: 'announcements', type: 0, parent_id: '1', position: 1 },
          { id: '4', name: 'introductions', type: 0, parent_id: '1', position: 2 },
          // GENERAL category
          { id: '5', name: 'GENERAL', type: 4, position: 1 },
          { id: '6', name: 'general', type: 0, parent_id: '5', position: 0 },
          { id: '7', name: 'off-topic', type: 0, parent_id: '5', position: 1 },
          { id: '8', name: 'resources', type: 0, parent_id: '5', position: 2 },
          { id: '9', name: 'media', type: 0, parent_id: '5', position: 3 },
          // VOICE category
          { id: '10', name: 'VOICE', type: 4, position: 2 },
          { id: '11', name: 'Lounge', type: 2, parent_id: '10', position: 0 },
          { id: '12', name: 'Focus Room', type: 2, parent_id: '10', position: 1 },
        ],
      },
    },
    {
      id: 'add_user',
      type: 'discord.add_member',
      label: 'Adding you to your new server',
      dependsOn: ['create_server'],
      config: {
        guildId: '{{steps.create_server.output.guildId}}',
        userId: '{{platform.userId}}',
      },
    },
    {
      id: 'transfer_ownership',
      type: 'discord.transfer_ownership',
      label: 'Transferring server ownership to you',
      dependsOn: ['add_user'],
      config: {
        guildId: '{{steps.create_server.output.guildId}}',
        newOwnerId: '{{platform.userId}}',
      },
    },
    {
      id: 'create_invite',
      type: 'discord.create_invite',
      label: 'Generating your invite link',
      dependsOn: ['transfer_ownership'],
      config: {
        guildId: '{{steps.create_server.output.guildId}}',
        channelId: '{{steps.create_server.output.generalChannelId}}',
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

  await prisma.bundle.upsert({
    where: { slug: 'community-discord-server' },
    create: {
      slug: 'community-discord-server',
      name: 'Community Server',
      tagline: 'A fully built Discord server, ready in seconds',
      description: 'Buy once, and we\'ll create a complete Discord server under your account — organized categories, text and voice channels, role structure, and your invite link. No templates, no setup. Just your server.',
      platform: 'DISCORD',
      priceCents: 1499,
      stripePriceId: 'price_COMMUNITY_DISCORD',
      tags: ['discord', 'community', 'server'],
      previewItems: [
        '3 organized categories (Welcome, General, Voice)',
        '8 text channels pre-named and ready',
        '2 voice channels',
        'Moderator & Member roles',
        'Server ownership transferred to you',
        'Invite link delivered instantly',
      ],
      definition: COMMUNITY_DISCORD_DEFINITION as object,
      sortOrder: 0,
    },
    update: {
      definition: COMMUNITY_DISCORD_DEFINITION as object,
      tagline: 'A fully built Discord server, ready in seconds',
      previewItems: [
        '3 organized categories (Welcome, General, Voice)',
        '8 text channels pre-named and ready',
        '2 voice channels',
        'Moderator & Member roles',
        'Server ownership transferred to you',
        'Invite link delivered instantly',
      ],
    },
  })

  console.log('Seeded 3 bundles ✓')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
