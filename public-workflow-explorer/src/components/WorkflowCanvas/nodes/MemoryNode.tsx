/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Database, ShieldCheck } from 'lucide-react'
import type { WorkflowNode } from '../../../types/workflow'

interface MemoryNodeProps {
  data: {
    raw: WorkflowNode
    isHighlighted?: boolean
    isSelected?: boolean
  }
}

export const MemoryNode: React.FC<MemoryNodeProps> = ({ data }) => {
  const { raw, isHighlighted, isSelected } = data

  return (
    <div
      className={`relative w-[230px] rounded-lg border bg-white dark:bg-slate-900 p-2.5 backdrop-blur-sm transition-all duration-200 shadow-md ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500 shadow-lg'
          : isHighlighted
          ? 'border-emerald-500 ring-1 ring-emerald-400 shadow-md'
          : 'border-emerald-400 dark:border-emerald-500/50 hover:border-emerald-500'
      }`}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="ai_memory"
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-slate-900"
      />

      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <Database className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Chat Memory</span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-semibold">
          PostgreSQL
        </span>
      </div>

      <div className="mt-2">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate" title={raw.name}>
          {raw.name}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Tenant & Job Scoped</span>
        </div>
      </div>
    </div>
  )
}
