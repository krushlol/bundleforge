export type Platform = 'discord' | 'notion' | 'github' | 'slack'

export interface BundleDefinition {
  platform: Platform
  version: '1'
  inputs?: BundleInput[]
  templateCode?: string
  steps: BundleStep[]
}

export interface BundleInput {
  id: string
  label: string
  placeholder?: string
  required: boolean
  type: 'text' | 'url' | 'boolean' | 'select'
  options?: string[]
  maxLength?: number
}

export interface BundleStep {
  id: string
  type: StepType
  label: string
  dependsOn?: string[]
  config: Record<string, unknown>
}

export type StepType =
  | 'discord.create_server_from_template'
  | 'discord.add_member'
  | 'discord.transfer_ownership'
  | 'discord.create_invite'
  | 'discord.bot_leave'
  | 'github.create_repo'
  | 'github.create_labels'
  | 'github.create_files'
  | 'github.set_branch_protection'
  | 'github.create_project_board'
  | 'slack.create_channel'
  | 'slack.set_topic'
  | 'slack.set_purpose'
  | 'slack.post_message'
  | 'slack.pin_message'
  | 'slack.invite_member'
  | 'notion.create_page'
  | 'notion.create_database'
  | 'notion.append_blocks'
