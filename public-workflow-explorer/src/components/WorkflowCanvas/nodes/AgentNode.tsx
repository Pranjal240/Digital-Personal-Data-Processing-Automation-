import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Bot, Sparkles, Shield, Cpu, Wrench } from 'lucide-react'
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
  
  // Color themes
  const colorMap: Record<string, { border: string; glow: string; badge: string; text: string }> = {
    A0: { border: 'border-indigo-500/80', glow: 'shadow-indigo-500/20', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', text: 'text-indigo-400' },
    A1: { border: 'border-blue-500/80', glow: 'shadow-blue-500/20', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'text-blue-400' },
    A2: { border: 'border-cyan-500/80', glow: 'shadow-cyan-500/20', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', text: 'text-cyan-400' },
    A3: { border: 'border-emerald-500/80', glow: 'shadow-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'text-emerald-400' },
    A4: { border: 'border-teal-500/80', glow: 'shadow-teal-500/20', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30', text: 'text-teal-400' },
    A5: { border: 'border-amber-500/80', glow: 'shadow-amber-500/20', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'text-amber-400' },
    A6: { border: 'border-rose-500/80', glow: 'shadow-rose-500/20', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'text-rose-400' },
    A7: { border: 'border-purple-500/80', glow: 'shadow-purple-500/20', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', text: 'text-purple-400' },
    A8: { border: 'border-orange-500/80', glow: 'shadow-orange-500/20', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30', text: 'text-orange-400' },
  }

  const theme = colorMap[agentId] || {
    border: 'border-violet-500/80',
    glow: 'shadow-violet-500/20',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    text: 'text-violet-400',
  }

  return (
    <div
      className={`relative w-[300px] rounded-xl border bg-slate-900/95 p-3.5 backdrop-blur-md transition-all duration-300 shadow-xl ${
        isSelected
          ? 'border-white ring-2 ring-indigo-400 shadow-2xl scale-[1.02]'
          : isHighlighted
          ? `${theme.border} ring-2 ring-indigo-400/50 shadow-lg ${theme.glow}`
          : isFallback
          ? 'border-slate-700/80 hover:border-slate-500'
          : `${theme.border} hover:border-opacity-100 ${theme.glow}`
      }`}
    >
      {/* Top Main Flow Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="main"
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-slate-900"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isFallback ? 'bg-slate-800 text-slate-300' : 'bg-indigo-500/10 text-indigo-400'}`}>
            {isFallback ? <Shield className="w-4 h-4 text-amber-400" /> : <Bot className="w-4 h-4 text-indigo-400" />}
          </div>
          <div>
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold ${theme.badge}`}>
              {isFallback ? `FALLBACK ${agentId}` : `AGENT ${agentId}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>AI Agent</span>
        </div>
      </div>

      {/* Body */}
      <div className="mt-2.5">
        <h4 className="text-sm font-semibold text-slate-100 truncate tracking-tight" title={raw.name}>
          {raw.name}
        </h4>
        <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {raw._meta.stage.name}
        </p>
      </div>

      {/* Agent Badges / Meta */}
      <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-800/80 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-slate-500" />
          <span className="font-mono truncate max-w-[120px]">
            {isFallback ? 'OpenRouter Fallback' : 'Gemini 1.5/2.0'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Wrench className="w-3 h-3" />
          <span>Tools Supported</span>
        </div>
      </div>

      {/* Outgoing Main Flow Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="main"
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-slate-900"
      />

      {/* Bottom Handles for Model / Tool / Memory */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="ai_languageModel"
        style={{ left: '25%' }}
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-slate-900"
        title="Language Model Connection"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="ai_memory"
        style={{ left: '50%' }}
        className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-slate-900"
        title="Memory Connection"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="ai_tool"
        style={{ left: '75%' }}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900"
        title="Tool Connection"
      />
    </div>
  )
}

