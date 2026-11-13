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
      className={`relative w-[230px] rounded-lg border bg-slate-900/90 p-2.5 backdrop-blur-sm transition-all duration-200 shadow-md ${
        isSelected
          ? 'border-white ring-2 ring-emerald-400 shadow-xl'
          : isHighlighted
          ? 'border-emerald-400 ring-1 ring-emerald-400 shadow-lg'
          : 'border-emerald-500/40 hover:border-emerald-400'
      }`}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="ai_memory"
        className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
            <Database className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Chat Memory</span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
          PostgreSQL
        </span>
      </div>

      <div className="mt-2">
        <div className="text-xs font-medium text-slate-200 truncate" title={raw.name}>
          {raw.name}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Tenant & Job Scoped</span>
        </div>
      </div>
    </div>
  )
}

