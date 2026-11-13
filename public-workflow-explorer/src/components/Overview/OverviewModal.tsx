import React from 'react'
import {
  X,
  Layers,
  GitBranch,
  CheckCircle2
} from 'lucide-react'
import type { StatsInfo, StageInfo } from '../../types/workflow'

interface OverviewModalProps {
  isOpen: boolean
  onClose: () => void
  stats: StatsInfo
  stages: StageInfo[]
}

export const OverviewModal: React.FC<OverviewModalProps> = ({
  isOpen,
  onClose,
  stats,
  stages,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                DPDP AI Automation System Overview
              </h2>
              <p className="text-xs text-slate-400">
                Verified structural telemetry computed from the sanitized n8n production workflow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Nodes</span>
              <span className="text-2xl font-mono font-bold text-slate-100 mt-1 block">{stats.totalNodes}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">91 active + 15 sticky</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Connections</span>
              <span className="text-2xl font-mono font-bold text-indigo-400 mt-1 block">{stats.totalConnections}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">77 main + 42 AI links</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">AI Agents</span>
              <span className="text-2xl font-mono font-bold text-cyan-400 mt-1 block">{stats.agents.totalAgentNodes}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">9 Primary + 9 Fallback</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">Postgres DB</span>
              <span className="text-2xl font-mono font-bold text-blue-400 mt-1 block">{stats.databaseNodes}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">State & audit nodes</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">FastAPI</span>
              <span className="text-2xl font-mono font-bold text-violet-400 mt-1 block">{stats.httpNodes}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Extract, export, error</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Stages</span>
              <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">{stats.stagesCount}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Row 01 – Row 12</span>
            </div>
          </div>

          {/* Connection Types Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span>Edge Topology & Multi-Protocol Connections Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-indigo-500/20">
                <div className="flex justify-between items-center text-indigo-300 font-semibold">
                  <span>Main Execution Flow</span>
                  <span className="font-mono text-sm">{stats.connectionsByType.main || 77}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Sequential control flow and data routing</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/20">
                <div className="flex justify-between items-center text-amber-300 font-semibold">
                  <span>LLM Model Connections</span>
                  <span className="font-mono text-sm">{stats.connectionsByType.ai_languageModel || 18}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Gemini & OpenRouter paired to agents</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20">
                <div className="flex justify-between items-center text-cyan-300 font-semibold">
                  <span>Tool Connections</span>
                  <span className="font-mono text-sm">{stats.connectionsByType.ai_tool || 22}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Deterministic retrieval & verification tools</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/20">
                <div className="flex justify-between items-center text-emerald-300 font-semibold">
                  <span>Chat Memory Links</span>
                  <span className="font-mono text-sm">{stats.connectionsByType.ai_memory || 2}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">PostgreSQL session-scoped memories</p>
              </div>
            </div>
          </div>

          {/* Workflow Execution Pipeline Stages */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full Pipeline Stages (12 Documented Rows)</span>
            </h3>

            <div className="space-y-2">
              {stages.map((stg) => (
                <div
                  key={stg.id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {stg.row}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100">{stg.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">{stg.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 shrink-0">
                    {stg.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Sanitized Architecture Export • Zero Credentials or Internal URLs</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
