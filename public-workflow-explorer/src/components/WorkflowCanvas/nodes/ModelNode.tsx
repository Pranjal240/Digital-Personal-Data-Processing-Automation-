import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Sparkles, Cpu, Layers } from 'lucide-react'
import type { WorkflowNode } from '../../../types/workflow'

interface ModelNodeProps {
  data: {
    raw: WorkflowNode
    isHighlighted?: boolean
    isSelected?: boolean
  }
}

export const ModelNode: React.FC<ModelNodeProps> = ({ data }) => {
  const { raw, isHighlighted, isSelected } = data
  const isOpenRouter = raw.type.includes('OpenRouter') || raw.name.toLowerCase().includes('openrouter')
  const modelName = raw.parameters?.modelName || (isOpenRouter ? 'google/gemini-flash' : 'gemini-1.5-pro')

  return (
    <div
      className={`relative w-[240px] rounded-lg border bg-slate-900/90 p-2.5 backdrop-blur-sm transition-all duration-200 shadow-md ${
        isSelected
          ? 'border-white ring-2 ring-amber-400 shadow-xl'
          : isHighlighted
          ? 'border-amber-400 ring-1 ring-amber-400 shadow-lg'
          : isOpenRouter
          ? 'border-orange-500/50 hover:border-orange-400'
          : 'border-amber-500/50 hover:border-amber-400'
      }`}
    >
      {/* Top Handle - connects to agent's bottom ai_languageModel handle */}
      <Handle
        type="source"
        position={Position.Top}
        id="ai_languageModel"
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded ${isOpenRouter ? 'bg-orange-500/10 text-orange-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">
            {isOpenRouter ? 'OpenRouter LLM' : 'Google Gemini LLM'}
          </span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          Model
        </span>
      </div>

      <div className="mt-2">
        <div className="text-xs font-medium text-slate-200 truncate" title={raw.name}>
          {raw.name}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <Cpu className="w-3 h-3 text-slate-500" />
          <span className="truncate">{modelName}</span>
        </div>
      </div>

      <div className="mt-2 pt-1.5 flex items-center justify-between border-t border-slate-800/60 text-[9px] text-slate-500">
        <span className="flex items-center gap-1">
          <Layers className="w-2.5 h-2.5" />
          <span>Temp: {raw.parameters?.temperature ?? 'Default'}</span>
        </span>
        <span className="text-amber-400/90 font-medium">Provider Verified</span>
      </div>
    </div>
  )
}

