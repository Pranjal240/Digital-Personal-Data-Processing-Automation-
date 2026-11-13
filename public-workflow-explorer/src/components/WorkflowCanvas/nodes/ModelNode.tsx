/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Cpu, Layers } from 'lucide-react'
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
      className={`relative w-[240px] rounded-lg border bg-white dark:bg-slate-900 p-2.5 backdrop-blur-sm transition-all duration-200 shadow-md ${
        isSelected
          ? 'border-amber-600 ring-2 ring-amber-500 shadow-lg'
          : isHighlighted
          ? 'border-amber-500 ring-1 ring-amber-400 shadow-md'
          : isOpenRouter
          ? 'border-orange-400 dark:border-orange-500/50 hover:border-orange-500'
          : 'border-amber-400 dark:border-amber-500/50 hover:border-amber-500'
      }`}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="ai_languageModel"
        className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white dark:!border-slate-900"
      />

      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded ${isOpenRouter ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
            {isOpenRouter ? 'OpenRouter Gateway' : 'Google Gemini LLM'}
          </span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
          Model
        </span>
      </div>

      <div className="mt-2">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate" title={raw.name}>
          {raw.name}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <Layers className="w-3 h-3 text-slate-400" />
          <span className="truncate">{modelName}</span>
        </div>
      </div>

      <div className="mt-2 pt-1.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 text-[9px] text-slate-500">
        <span>Temp: {raw.parameters?.temperature ?? 'Default'}</span>
        <span className="text-amber-600 dark:text-amber-400 font-semibold">Resilience Verified</span>
      </div>
    </div>
  )
}
