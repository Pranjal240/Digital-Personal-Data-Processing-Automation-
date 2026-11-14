import React, { useState } from 'react'
import {
  X,
  Bot,
  Cpu,
  Wrench,
  Shield,
  ArrowRight,
  RefreshCw,
  Eye,
  CheckCircle
} from 'lucide-react'
import type { AgentInfo } from '../../types/workflow'

interface AgentExplorerModalProps {
  isOpen: boolean
  onClose: () => void
  agents: AgentInfo[]
  onSelectAgent: (agentId: string) => void
}

export const AgentExplorerModal: React.FC<AgentExplorerModalProps> = ({
  isOpen,
  onClose,
  agents,
  onSelectAgent,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('A0')

  if (!isOpen) return null

  const currentAgent = agents.find((a) => a.id === selectedAgentId) || agents[0]

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white shadow-md shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  Multi-Agent Architecture (A0–A8)
                </h2>
                <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                  9 Specialized Agents
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Prompts, deterministic tools, and autonomous QA revision loops
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cooperative Flow Diagram Banner */}
        <div className="p-2.5 sm:p-4 bg-slate-100/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto shrink-0 no-scrollbar">
          <div className="flex items-center justify-between min-w-[680px] gap-1.5 sm:gap-2 px-1 sm:px-2">
            {agents.map((ag, i) => (
              <React.Fragment key={ag.id}>
                <button
                  onClick={() => setSelectedAgentId(ag.id)}
                  className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition border shrink-0 ${
                    selectedAgentId === ag.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{ag.id}</span>
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[65px] mt-0.5">
                    {ag.title.split(' ')[0]}
                  </span>
                </button>
                {i < agents.length - 1 && (
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Modal Main Body (2 Columns) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left Column: Agent Selector List */}
          <div className="md:col-span-4 p-3 sm:p-4 space-y-1.5 overflow-y-auto max-h-36 md:max-h-[60vh] shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1 sm:px-2 block mb-1">
              Select Specialist Agent
            </span>
            {agents.map((ag) => {
              const isSelected = selectedAgentId === ag.id
              return (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgentId(ag.id)}
                  className={`w-full text-left p-2 sm:p-3 rounded-xl border transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      {ag.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      {ag.stageName.split(':')[0]}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {ag.name}
                  </div>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {ag.title}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Right Column: Agent Deep-Dive Details */}
          <div className="md:col-span-8 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[65vh] md:max-h-[60vh]">
            {/* Title and Canvas Highlight Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    {currentAgent.id}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{currentAgent.name}</h3>
                </div>
                <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {currentAgent.title} • {currentAgent.stageName}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectAgent(currentAgent.id)
                  onClose()
                }}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Locate on Canvas</span>
              </button>
            </div>

            {/* Responsibility description */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 sm:p-4 space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Core Compliance Responsibility
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentAgent.responsibility}
              </p>
            </div>

            {/* Input & Output Contracts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3 sm:p-3.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                  Input Contract
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{currentAgent.inputs}</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3 sm:p-3.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Output Contract
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{currentAgent.outputs}</p>
              </div>
            </div>

            {/* Dual LLM Configuration (Primary & Fallback) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 sm:p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Dual-Tier Model Resilience Architecture</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold block text-[11px]">Primary Model Node:</span>
                  <div className="mt-1 text-slate-800 dark:text-slate-200 font-mono font-medium">{currentAgent.primaryModel}</div>
                  <span className="mt-0.5 text-[10px] text-slate-500 block truncate">Node: {currentAgent.primaryNode}</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-500/30">
                  <span className="text-orange-600 dark:text-orange-400 font-semibold block text-[11px]">Autonomous Fallback Node:</span>
                  <div className="mt-1 text-slate-800 dark:text-slate-200 font-mono font-medium">{currentAgent.fallbackModel}</div>
                  <span className="mt-0.5 text-[10px] text-slate-500 block truncate">Node: {currentAgent.fallbackNode}</span>
                </div>
              </div>
            </div>

            {/* Connected Tools */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Connected Deterministic Tools</span>
              </h4>
              {currentAgent.tools.length > 0 ? (
                <div className="space-y-2">
                  {currentAgent.tools.map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/30 text-xs">
                      <span className="font-mono text-cyan-700 dark:text-cyan-400 font-semibold">{t.name}</span>
                      <p className="mt-0.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{t.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No external tools connected; operates via zero-shot/few-shot prompt reasoning.</p>
              )}
            </div>

            {/* System Prompt Rules */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>System Prompt Governing Rules</span>
              </h4>
              <ul className="space-y-1.5">
                {currentAgent.keyRules.map((r, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Includes 2 automated QA self-correction loops & 2 human revision attempts</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition font-medium"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  )
}
