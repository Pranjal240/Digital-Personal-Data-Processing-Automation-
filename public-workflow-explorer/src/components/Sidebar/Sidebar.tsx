import React from 'react'
import {
  Search,
  Bot,
  Webhook,
  FileText,
  ShieldCheck,
  Cpu,
  Database,
  FileCheck,
  UserCheck,
  Layers,
  ChevronRight,
  Filter,
  X
} from 'lucide-react'
import type { AgentInfo, StageInfo, NodeCategory } from '../../types/workflow'

interface SidebarProps {
  agents: AgentInfo[]
  stages: StageInfo[]
  searchQuery: string
  onSearchChange: (q: string) => void
  activeCategory: NodeCategory | 'all'
  onSelectCategory: (cat: NodeCategory | 'all') => void
  activeStageId: string | null
  onSelectStage: (stageId: string | null) => void
  onFocusAgent: (agentId: string) => void
  selectedAgentId: string | null
  isOpen: boolean
  onToggleOpen: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  agents,
  stages,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  activeStageId,
  onSelectStage,
  onFocusAgent,
  selectedAgentId,
  isOpen,
  onToggleOpen,
}) => {
  const categoryFilters: { id: NodeCategory | 'all'; label: string; icon: React.ReactNode; countLabel: string }[] = [
    { id: 'all', label: 'All Workflow Nodes', icon: <Layers className="w-4 h-4 text-slate-400" />, countLabel: '106' },
    { id: 'agent', label: 'AI Agents (A0–A8)', icon: <Bot className="w-4 h-4 text-indigo-400" />, countLabel: '18' },
    { id: 'trigger', label: 'Triggers & Webhooks', icon: <Webhook className="w-4 h-4 text-emerald-400" />, countLabel: '2' },
    { id: 'http', label: 'FastAPI Backend', icon: <FileText className="w-4 h-4 text-violet-400" />, countLabel: '3' },
    { id: 'database', label: 'PostgreSQL Database', icon: <Database className="w-4 h-4 text-blue-400" />, countLabel: '9' },
    { id: 'model', label: 'LLM Language Models', icon: <Cpu className="w-4 h-4 text-amber-400" />, countLabel: '18' },
    { id: 'tool', label: 'Verification Tools', icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />, countLabel: '9' },
    { id: 'code', label: 'Validation Scripts', icon: <FileCheck className="w-4 h-4 text-slate-300" />, countLabel: '17' },
    { id: 'humanGate', label: 'Human Review Gate', icon: <UserCheck className="w-4 h-4 text-fuchsia-400" />, countLabel: '1' },
  ]

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed top-16 left-4 z-40 p-2.5 rounded-xl border border-slate-800 bg-slate-900/95 text-slate-300 hover:text-white shadow-2xl backdrop-blur-md transition flex items-center gap-2 text-xs font-semibold"
        title="Open Navigation Sidebar"
      >
        <Filter className="w-4 h-4 text-indigo-400" />
        <span>Workflow Index</span>
      </button>
    )
  }

  return (
    <aside className="fixed top-14 bottom-0 left-0 w-80 bg-slate-900/98 border-r border-slate-800 z-40 flex flex-col backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Sidebar Header with Search */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Workflow Architecture
            </h3>
          </div>
          <button
            onClick={onToggleOpen}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Collapse Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search nodes, agents, tools..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
        {/* Category Filters */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5">
            Node Categories
          </h4>
          <div className="space-y-0.5">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    activeCategory === cat.id ? 'bg-indigo-800/80 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat.countLabel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Specialized Agents A0-A8 */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Specialized Agents (A0–A8)
            </h4>
            <span className="text-[10px] text-indigo-400 font-mono">9 Agents</span>
          </div>

          <div className="space-y-1">
            {agents.map((ag) => {
              const isSelected = selectedAgentId === ag.id
              return (
                <button
                  key={ag.id}
                  onClick={() => onFocusAgent(ag.id)}
                  className={`w-full text-left p-2 rounded-lg border transition group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                      : 'border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {ag.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                      {ag.stageId.replace('stage-', 'Row ')}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                    {ag.name}
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">
                    {ag.title}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Stages List (Row 01 - Row 12) */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Workflow Stages (12)
            </h4>
            {activeStageId && (
              <button
                onClick={() => onSelectStage(null)}
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-1">
            {stages.map((stg) => {
              const isSelected = activeStageId === stg.id
              return (
                <button
                  key={stg.id}
                  onClick={() => onSelectStage(isSelected ? null : stg.id)}
                  className={`w-full text-left p-2 rounded-lg border transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-slate-800/60 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span className="font-semibold text-indigo-400">{stg.row}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </div>
                  <div className="mt-0.5 font-medium text-slate-200 text-xs truncate">
                    {stg.title}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}

