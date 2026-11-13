/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

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
  FileCheck
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
  headerBg: string
  icon: React.ReactNode
}

export const GenericNode: React.FC<GenericNodeProps> = ({ data }) => {
  const { raw, isHighlighted, isSelected } = data
  const category: NodeCategory = raw._meta.category

  const configMap: Record<NodeCategory, CategoryConfig> = {
    trigger: {
      title: 'Workflow Trigger',
      badge: 'TRIGGER',
      border: 'border-teal-500 dark:border-teal-500/80',
      bg: 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400',
      headerBg: 'bg-teal-50/60 dark:bg-teal-950/20',
      icon: <Webhook className="w-4 h-4" />,
    },
    database: {
      title: 'PostgreSQL DB',
      badge: 'DATABASE',
      border: 'border-blue-500 dark:border-blue-500/80',
      bg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
      headerBg: 'bg-blue-50/60 dark:bg-blue-950/20',
      icon: <Database className="w-4 h-4" />,
    },
    http: {
      title: 'FastAPI Backend',
      badge: 'HTTP REST',
      border: 'border-violet-500 dark:border-violet-500/80',
      bg: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
      headerBg: 'bg-violet-50/60 dark:bg-violet-950/20',
      icon: <Globe className="w-4 h-4" />,
    },
    code: {
      title: 'Data & Evidence Script',
      badge: 'JS/CODE',
      border: 'border-slate-400 dark:border-slate-600',
      bg: 'bg-slate-200 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300',
      headerBg: 'bg-slate-100/70 dark:bg-slate-800/20',
      icon: <Code2 className="w-4 h-4" />,
    },
    condition: {
      title: 'Logic Branch',
      badge: 'IF COND',
      border: 'border-amber-500 dark:border-amber-500/80',
      bg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
      headerBg: 'bg-amber-50/60 dark:bg-amber-950/20',
      icon: <GitBranch className="w-4 h-4" />,
    },
    router: {
      title: 'Revision Router',
      badge: 'SWITCH',
      border: 'border-orange-500 dark:border-orange-500/80',
      bg: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',
      headerBg: 'bg-orange-50/60 dark:bg-orange-950/20',
      icon: <Split className="w-4 h-4" />,
    },
    notification: {
      title: 'Email Delivery',
      badge: 'GMAIL API',
      border: 'border-rose-500 dark:border-rose-500/80',
      bg: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
      headerBg: 'bg-rose-50/60 dark:bg-rose-950/20',
      icon: <Mail className="w-4 h-4" />,
    },
    humanGate: {
      title: 'Human Approval Gate',
      badge: 'HUMAN-IN-LOOP',
      border: 'border-fuchsia-500 dark:border-fuchsia-500/80',
      bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-400',
      headerBg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/20',
      icon: <UserCheck className="w-4 h-4" />,
    },
    webhookResponse: {
      title: 'HTTP Response',
      badge: 'HTTP RESP',
      border: 'border-teal-500 dark:border-teal-500/80',
      bg: 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400',
      headerBg: 'bg-teal-50/60 dark:bg-teal-950/20',
      icon: <ArrowRightCircle className="w-4 h-4" />,
    },
    stop: {
      title: 'Terminal / Stop',
      badge: 'TERMINAL',
      border: 'border-red-500 dark:border-red-500/80',
      bg: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
      headerBg: 'bg-red-50/60 dark:bg-red-950/20',
      icon: <AlertOctagon className="w-4 h-4" />,
    },
    agent: {
      title: 'Agent',
      badge: 'AGENT',
      border: 'border-indigo-500',
      bg: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
      headerBg: 'bg-indigo-50/60 dark:bg-indigo-950/20',
      icon: <FileCheck className="w-4 h-4" />,
    },
    model: {
      title: 'Model',
      badge: 'MODEL',
      border: 'border-amber-500',
      bg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
      headerBg: 'bg-amber-50/60 dark:bg-amber-950/20',
      icon: <FileCheck className="w-4 h-4" />,
    },
    tool: {
      title: 'Tool',
      badge: 'TOOL',
      border: 'border-cyan-500',
      bg: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400',
      headerBg: 'bg-cyan-50/60 dark:bg-cyan-950/20',
      icon: <FileCheck className="w-4 h-4" />,
    },
    memory: {
      title: 'Memory',
      badge: 'MEMORY',
      border: 'border-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
      headerBg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      icon: <Database className="w-4 h-4" />,
    },
    stickyNote: {
      title: 'Sticky',
      badge: 'STAGE',
      border: 'border-slate-300 dark:border-slate-800',
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      headerBg: 'bg-slate-50 dark:bg-slate-900',
      icon: <FileCheck className="w-4 h-4" />,
    },
    other: {
      title: 'Workflow Node',
      badge: 'NODE',
      border: 'border-slate-300 dark:border-slate-700',
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      headerBg: 'bg-slate-50 dark:bg-slate-900',
      icon: <FileCheck className="w-4 h-4" />,
    },
  }

  const currentConfig = configMap[category] || configMap.other

  return (
    <div
      className={`relative w-[280px] rounded-xl border bg-white dark:bg-slate-900 p-3 backdrop-blur-md transition-all duration-200 shadow-md ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500 shadow-xl scale-[1.02]'
          : isHighlighted
          ? `${currentConfig.border} ring-2 ring-indigo-400/50 shadow-lg`
          : `${currentConfig.border} hover:shadow-lg`
      }`}
    >
      {/* Input Handle (Left) */}
      {category !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          id="main"
          className="!w-2.5 !h-2.5 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900"
        />
      )}

      {/* Header */}
      <div className={`flex items-center justify-between pb-2 -mx-3 -mt-3 px-3 pt-2.5 rounded-t-xl border-b border-slate-100 dark:border-slate-800 ${currentConfig.headerBg}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${currentConfig.bg}`}>
            {currentConfig.icon}
          </div>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold tracking-wider">
            {currentConfig.badge}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[105px]">
          {raw._meta.stage.shortName}
        </span>
      </div>

      {/* Name & Subtitle */}
      <div className="mt-2.5">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight" title={raw.name}>
          {raw.name}
        </h4>
        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
          {raw.type.replace('@n8n/n8n-nodes-langchain.', '').replace('n8n-nodes-base.', '')}
        </p>
      </div>

      {/* Output Handles (Right) */}
      {category === 'router' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="route-0"
            style={{ top: '20%' }}
            className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white dark:!border-slate-900"
            title="Route 0: Agent 3 (RoPA)"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="route-1"
            style={{ top: '40%' }}
            className="!w-2.5 !h-2.5 !bg-teal-500 !border-2 !border-white dark:!border-slate-900"
            title="Route 1: Agent 4 (Data Flow)"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="route-2"
            style={{ top: '60%' }}
            className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white dark:!border-slate-900"
            title="Route 2: Agent 5 (DPDP Mapping)"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="route-3"
            style={{ top: '80%' }}
            className="!w-2.5 !h-2.5 !bg-rose-500 !border-2 !border-white dark:!border-slate-900"
            title="Route 3: Agent 6 (Risk Assessment)"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="main"
            style={{ top: '50%' }}
            className="!w-2.5 !h-2.5 !bg-orange-500 !border-2 !border-white dark:!border-slate-900 opacity-0"
          />
        </>
      ) : category === 'condition' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '35%' }}
            className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-slate-900"
            title="Output 0 / True"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '65%' }}
            className="!w-2.5 !h-2.5 !bg-rose-500 !border-2 !border-white dark:!border-slate-900"
            title="Output 1 / False"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="main"
            style={{ top: '50%' }}
            className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white dark:!border-slate-900 opacity-0"
          />
        </>
      ) : category !== 'stop' && category !== 'webhookResponse' ? (
        <Handle
          type="source"
          position={Position.Right}
          id="main"
          className="!w-2.5 !h-2.5 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900"
        />
      ) : null}
    </div>
  )
}
