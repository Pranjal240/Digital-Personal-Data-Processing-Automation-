/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Bot, Shield, Cpu, Wrench } from 'lucide-react'
import type { WorkflowNode } from '../../../types/workflow'

interface AgentNodeProps {
  data: {
    raw: WorkflowNode
    isHighlighted?: boolean
    isSelected?: boolean
  }
}

export const AgentNode: React.FC<AgentNodeProps> = ({ data }) => {
  const { raw, isHighlighted, isSelected } = data
  const isFallback = raw.name.toLowerCase().includes('fallback')
  const agentId = raw._meta.agentId || 'AI'

  // Dedicated Color Palettes for each specialist agent (Day & Night ready)
  const agentColorMap: Record<
    string,
    { border: string; glow: string; badge: string; text: string; headerBg: string }
  > = {
    A0: {
      border: 'border-indigo-500 dark:border-indigo-500/80',
      glow: 'shadow-indigo-500/20',
      badge: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      headerBg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    },
    A1: {
      border: 'border-blue-500 dark:border-blue-500/80',
      glow: 'shadow-blue-500/20',
      badge: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
      headerBg: 'bg-blue-50/50 dark:bg-blue-950/20',
    },
    A2: {
      border: 'border-cyan-500 dark:border-cyan-500/80',
      glow: 'shadow-cyan-500/20',
      badge: 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      headerBg: 'bg-cyan-50/50 dark:bg-cyan-950/20',
    },
    A3: {
      border: 'border-emerald-500 dark:border-emerald-500/80',
      glow: 'shadow-emerald-500/20',
      badge: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    A4: {
      border: 'border-teal-500 dark:border-teal-500/80',
      glow: 'shadow-teal-500/20',
      badge: 'bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
      text: 'text-teal-600 dark:text-teal-400',
      headerBg: 'bg-teal-50/50 dark:bg-teal-950/20',
    },
    A5: {
      border: 'border-amber-500 dark:border-amber-500/80',
      glow: 'shadow-amber-500/20',
      badge: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      headerBg: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
    A6: {
      border: 'border-rose-500 dark:border-rose-500/80',
      glow: 'shadow-rose-500/20',
      badge: 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
      headerBg: 'bg-rose-50/50 dark:bg-rose-950/20',
    },
    A7: {
      border: 'border-purple-500 dark:border-purple-500/80',
      glow: 'shadow-purple-500/20',
      badge: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
      headerBg: 'bg-purple-50/50 dark:bg-purple-950/20',
    },
    A8: {
      border: 'border-orange-500 dark:border-orange-500/80',
      glow: 'shadow-orange-500/20',
      badge: 'bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
      text: 'text-orange-600 dark:text-orange-400',
      headerBg: 'bg-orange-50/50 dark:bg-orange-950/20',
    },
  }

  const theme = agentColorMap[agentId] || {
    border: 'border-violet-500 dark:border-violet-500/80',
    glow: 'shadow-violet-500/20',
    badge: 'bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30',
    text: 'text-violet-600 dark:text-violet-400',
    headerBg: 'bg-violet-50/50 dark:bg-violet-950/20',
  }

  return (
    <div
      className={`relative w-[300px] rounded-xl border bg-white dark:bg-slate-900 p-3.5 backdrop-blur-md transition-all duration-300 shadow-md ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500 shadow-xl scale-[1.02]'
          : isHighlighted
          ? `${theme.border} ring-2 ring-indigo-400/50 shadow-lg ${theme.glow}`
          : isFallback
          ? 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
          : `${theme.border} hover:shadow-lg ${theme.glow}`
      }`}
    >
      {/* Left Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="main"
        className="!w-3 !h-3 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900"
      />

      {/* Header */}
      <div className={`flex items-center justify-between pb-2 -mx-3.5 -mt-3.5 px-3.5 pt-3 rounded-t-xl border-b border-slate-100 dark:border-slate-800 ${theme.headerBg}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isFallback ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'}`}>
            {isFallback ? <Shield className="w-4 h-4 text-amber-500" /> : <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          </div>
          <div>
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-bold ${theme.badge}`}>
              {isFallback ? `FALLBACK ${agentId}` : `AGENT ${agentId}`}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
          AI Agent
        </span>
      </div>

      {/* Body */}
      <div className="mt-2.5">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight" title={raw.name}>
          {raw.name}
        </h4>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
          {raw._meta.stage.name}
        </p>
      </div>

      {/* Footer Badges */}
      <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span className="font-mono truncate max-w-[125px]">
            {isFallback ? 'OpenRouter Fallback' : 'Gemini 1.5/2.0'}
          </span>
        </div>
        <div className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
          <Wrench className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
          <span>Active Tools</span>
        </div>
      </div>

      {/* Right Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="main"
        className="!w-3 !h-3 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900"
      />

      {/* Bottom Model/Memory/Tool Handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="ai_languageModel"
        style={{ left: '25%' }}
        className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white dark:!border-slate-900"
        title="Model Connection"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="ai_memory"
        style={{ left: '50%' }}
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-slate-900"
        title="Memory Connection"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="ai_tool"
        style={{ left: '75%' }}
        className="!w-2.5 !h-2.5 !bg-cyan-500 !border-2 !border-white dark:!border-slate-900"
        title="Tool Connection"
      />
    </div>
  )
}
