import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Wrench, Search, Database, CheckCircle, FileText } from 'lucide-react'
import type { WorkflowNode } from '../../../types/workflow'

interface ToolNodeProps {
  data: {
    raw: WorkflowNode
    isHighlighted?: boolean
    isSelected?: boolean
  }
}

export const ToolNode: React.FC<ToolNodeProps> = ({ data }) => {
  const { raw, isHighlighted, isSelected } = data
  const name = raw.name

  // Tool icon selection based on name
  const getToolIcon = () => {
    if (name.includes('Evidence') || name.includes('Search')) {
      return <Search className="w-3.5 h-3.5 text-cyan-400" />
    }
    if (name.includes('DPDP') || name.includes('Requirements')) {
      return <FileText className="w-3.5 h-3.5 text-teal-400" />
    }
    if (name.includes('Cross-Verify') || name.includes('Verify')) {
      return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
    }
    if (name.includes('Processing') || name.includes('Metadata')) {
      return <Database className="w-3.5 h-3.5 text-blue-400" />
    }
    return <Wrench className="w-3.5 h-3.5 text-cyan-400" />
  }

  return (
    <div
      className={`relative w-[230px] rounded-lg border bg-slate-900/90 p-2.5 backdrop-blur-sm transition-all duration-200 shadow-md ${
        isSelected
          ? 'border-white ring-2 ring-cyan-400 shadow-xl'
          : isHighlighted
          ? 'border-cyan-400 ring-1 ring-cyan-400 shadow-lg'
          : 'border-cyan-500/40 hover:border-cyan-400/80'
      }`}
    >
      {/* Top Handle - connects to agent's bottom ai_tool handle */}
      <Handle
        type="source"
        position={Position.Top}
        id="ai_tool"
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            {getToolIcon()}
          </div>
          <span className="text-[11px] font-semibold text-slate-200">AI Tool</span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
          ToolCode
        </span>
      </div>

      <div className="mt-2">
        <div className="text-xs font-medium text-slate-200 truncate" title={raw.name}>
          {raw.name}
        </div>
        <p className="mt-1 text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
          {raw.parameters?.description || 'Custom deterministic tool executed by LLM Agent'}
        </p>
      </div>

      <div className="mt-2 pt-1.5 flex items-center justify-between border-t border-slate-800/60 text-[9px] text-slate-500">
        <span>Type: In-Process Script</span>
        <span className="text-cyan-400 font-mono">Dynamic Exec</span>
      </div>
    </div>
  )
}

