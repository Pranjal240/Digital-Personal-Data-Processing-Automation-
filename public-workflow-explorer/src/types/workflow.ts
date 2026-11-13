export type NodeCategory =
  | 'agent'
  | 'model'
  | 'tool'
  | 'memory'
  | 'database'
  | 'http'
  | 'trigger'
  | 'webhookResponse'
  | 'notification'
  | 'condition'
  | 'router'
  | 'code'
  | 'humanGate'
  | 'stop'
  | 'stickyNote'
  | 'other'

export interface NodeMeta {
  stage: {
    id: string
    name: string
    shortName: string
  }
  category: NodeCategory
  agentId: string | null
}

export interface WorkflowNode {
  id: string
  name: string
  type: string
  typeVersion?: number
  position: number[] | [number, number]
  parameters?: Record<string, any>
  credentials?: Record<string, { type: string; name: string; sanitized?: boolean }>
  notes?: string
  _meta: NodeMeta
}

export interface WorkflowConnectionTarget {
  node: string
  type: string
  index: number
}

export type WorkflowConnections = Record<
  string,
  Record<string, WorkflowConnectionTarget[][]>
>

export interface SanitizedWorkflow {
  name: string
  version: string
  nodes: WorkflowNode[]
  connections: WorkflowConnections
  metadata: {
    totalNodes: number
    totalConnections: number
    sanitized: boolean
    environment: string
    generatedAt: string
  }
}

export interface AgentTool {
  name: string
  description: string
}

export interface AgentInfo {
  id: string
  name: string
  title: string
  stageId: string
  stageName: string
  primaryNode: string
  primaryNodeId: string
  fallbackNode: string
  fallbackNodeId: string
  primaryModel: string
  fallbackModel: string
  memory: string | null
  tools: AgentTool[]
  responsibility: string
  inputs: string
  outputs: string
  pipelinePosition: string
  keyRules: string[]
  badgeColor: string
}

export interface StageInfo {
  id: string
  row: string
  title: string
  description: string
  yRange: [number, number]
  technologies: string[]
}

export interface StatsInfo {
  totalNodes: number
  operationalNodes: number
  stickyNoteSections: number
  totalConnections: number
  connectionsByType: Record<string, number>
  agents: {
    primaryAgents: number
    fallbackAgents: number
    totalAgentNodes: number
  }
  models: {
    geminiNodes: number
    openRouterNodes: number
    totalModelNodes: number
  }
  tools: {
    totalToolNodes: number
    toolTypes: string[]
  }
  integrations: string[]
  databaseNodes: number
  httpNodes: number
  codeNodes: number
  ifSwitchNodes: number
  emailNodes: number
  triggerNodes: number
  stagesCount: number
}
