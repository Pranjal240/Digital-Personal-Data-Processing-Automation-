import React from 'react'
import { Handle, Position } from '@xyflow/react'
import {
  Webhook,
  Database,
  Globe,
  Code2,
  GitBranch,
  Split,
  Mail,
  UserCheck,
  AlertOctagon,
  ArrowRightCircle,
  FileCheck,
  CheckCircle2
} from 'lucide-react'
import type { WorkflowNode, NodeCategory } from '../../../types/workflow'

interface GenericNodeProps {
  data: {
    raw: WorkflowNode
    isHighlighted?: boolean
    isSelected?: boolean
  }
}

interface CategoryConfig {
  title: string
  badge: string
  border: string
  bg: string
  icon: React.ReactNode
  accent: string
}

export const GenericNode: React.FC<GenericNodeProps> = ({ data }) => {
  const { raw, isHighlighted, isSelected } = data
  const category: NodeCategory = raw._meta.category

  const configMap: Record<NodeCategory, CategoryConfig> = {
    trigger: {
      title: 'Workflow Trigger',
      badge: 'TRIGGER',
      border: 'border-emerald-500/70',
      bg: 'bg-emerald-500/10 text-emerald-400',
      icon: <Webhook className="w-4 h-4" />,
      accent: 'emerald',
    },
    database: {
      title: 'PostgreSQL DB',
      badge: 'DATABASE',
      border: 'border-blue-500/70',
      bg: 'bg-blue-500/10 text-blue-400',
      icon: <Database className="w-4 h-4" />,
      accent: 'blue',
    },
    http: {
      title: 'FastAPI Backend',
      badge: 'HTTP REST',
      border: 'border-violet-500/70',
      bg: 'bg-violet-500/10 text-violet-400',
      icon: <Globe className="w-4 h-4" />,
      accent: 'violet',
    },
    code: {
      title: 'Data & Evidence Script',
      badge: 'JS/CODE',
      border: 'border-slate-600/70',
      bg: 'bg-slate-700/30 text-slate-300',
      icon: <Code2 className="w-4 h-4" />,
      accent: 'slate',
    },
    condition: {
      title: 'Logic Branch',
      badge: 'IF COND',
      border: 'border-amber-500/70',
      bg: 'bg-amber-500/10 text-amber-400',
      icon: <GitBranch className="w-4 h-4" />,
      accent: 'amber',
    },
    router: {
      title: 'Revision Router',
      badge: 'SWITCH',
      border: 'border-orange-500/70',
      bg: 'bg-orange-500/10 text-orange-400',
      icon: <Split className="w-4 h-4" />,
      accent: 'orange',
    },
    notification: {
      title: 'Email Delivery',
      badge: 'GMAIL API',
      border: 'border-rose-500/70',
      bg: 'bg-rose-500/10 text-rose-400',
      icon: <Mail className="w-4 h-4" />,
      accent: 'rose',
    },
    humanGate: {
      title: 'Human Approval Gate',
      badge: 'HUMAN-IN-LOOP',
      border: 'border-fuchsia-500/80',
      bg: 'bg-fuchsia-500/10 text-fuchsia-400',
      icon: <UserCheck className="w-4 h-4" />,
      accent: 'fuchsia',
    },
    webhookResponse: {
      title: 'HTTP Response',
      badge: 'HTTP RESP',
      border: 'border-teal-500/70',
      bg: 'bg-teal-500/10 text-teal-400',
      icon: <ArrowRightCircle className="w-4 h-4" />,
      accent: 'teal',
    },
    stop: {
      title: 'Terminal / Stop',
      badge: 'TERMINAL',
      border: 'border-red-500/70',
      bg: 'bg-red-500/10 text-red-400',
      icon: <AlertOctagon className="w-4 h-4" />,
      accent: 'red',
    },
    agent: {
      title: 'Agent',
      badge: 'AGENT',
      border: 'border-indigo-500',
      bg: 'bg-indigo-500/10 text-indigo-400',
      icon: <FileCheck className="w-4 h-4" />,
      accent: 'indigo',
    },
    model: {
      title: 'Model',
      badge: 'MODEL',
      border: 'border-amber-500',
      bg: 'bg-amber-500/10 text-amber-400',
      icon: <CheckCircle2 className="w-4 h-4" />,
      accent: 'amber',
    },
    tool: {
      title: 'Tool',
      badge: 'TOOL',
      border: 'border-cyan-500',
      bg: 'bg-cyan-500/10 text-cyan-400',
      icon: <FileCheck className="w-4 h-4" />,
      accent: 'cyan',
    },
    memory: {
      title: 'Memory',
      badge: 'MEMORY',
      border: 'border-emerald-500',
      bg: 'bg-emerald-500/10 text-emerald-400',
      icon: <Database className="w-4 h-4" />,
      accent: 'emerald',
    },
    stickyNote: {
      title: 'Sticky',
      badge: 'STAGE',
      border: 'border-slate-800',
      bg: 'bg-slate-800',
      icon: <FileCheck className="w-4 h-4" />,
      accent: 'slate',
    },
    other: {
      title: 'Workflow Node',
      badge: 'NODE',
      border: 'border-slate-700',
      bg: 'bg-slate-800 text-slate-300',
      icon: <FileCheck className="w-4 h-4" />,
      accent: 'slate',
    },
  }

  const currentConfig = configMap[category] || configMap.other
  const isBranchNode = category === 'condition' || category === 'router'

  return (
    <div
      className={`relative w-[260px] rounded-xl border bg-slate-900/95 p-3 backdrop-blur-md transition-all duration-200 shadow-md ${
        isSelected
          ? 'border-white ring-2 ring-indigo-400 shadow-xl scale-[1.02]'
          : isHighlighted
          ? `${currentConfig.border} ring-2 ring-indigo-400/40 shadow-lg`
          : `${currentConfig.border} hover:border-slate-400/80`
      }`}
    >
      {/* Inflow Handle (unless Webhook or ErrorTrigger) */}
      {category !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          id="main"
          className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
        />
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${currentConfig.bg}`}>
            {currentConfig.icon}
          </div>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-slate-700/60 bg-slate-800/80 text-slate-300 font-semibold tracking-wider">
            {currentConfig.badge}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[95px]">
          {raw._meta.stage.shortName}
        </span>
      </div>

      {/* Name & Subtitle */}
      <div className="mt-2.5">
        <h4 className="text-xs font-semibold text-slate-100 truncate tracking-tight" title={raw.name}>
          {raw.name}
        </h4>
        <p className="mt-0.5 text-[10px] text-slate-400 truncate">
          {raw.type.replace('@n8n/n8n-nodes-langchain.', '').replace('n8n-nodes-base.', '')}
        </p>
      </div>

      {/* Outflow Handles */}
      {isBranchNode ? (
        <>
          {/* Multi-branch outputs for IF / Switch */}
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '35%' }}
            className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-slate-900"
            title="Output 0 / True"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '65%' }}
            className="!w-2.5 !h-2.5 !bg-rose-400 !border-2 !border-slate-900"
            title="Output 1 / False"
          />
        </>
      ) : category !== 'stop' && category !== 'webhookResponse' ? (
        <Handle
          type="source"
          position={Position.Right}
          id="main"
          className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
        />
      ) : null}
    </div>
  )
}

