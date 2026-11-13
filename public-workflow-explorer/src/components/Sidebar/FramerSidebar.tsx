/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, createContext, useContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
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
  Pin,
  PinOff
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { AgentInfo, StageInfo, NodeCategory } from '../../types/workflow'

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  animate: boolean
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  const [openState, setOpenState] = useState(false)
  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface FramerSidebarProps {
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
  isMobileOpen?: boolean
  onToggleMobileOpen?: () => void
}

export const FramerSidebar: React.FC<FramerSidebarProps> = ({
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
  isMobileOpen,
  onToggleMobileOpen,
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const open = isMobileOpen !== undefined ? isMobileOpen : internalOpen
  const setOpen = (val: React.SetStateAction<boolean>) => {
    if (typeof val === 'function') {
      const next = val(open)
      if (onToggleMobileOpen) onToggleMobileOpen()
      setInternalOpen(next)
    } else {
      if (onToggleMobileOpen && val !== open) onToggleMobileOpen()
      setInternalOpen(val)
    }
  }

  const categoryFilters: { id: NodeCategory | 'all'; label: string; icon: React.ReactNode; countLabel: string }[] = [
    { id: 'all', label: 'All Nodes', icon: <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />, countLabel: '106' },
    { id: 'agent', label: 'AI Agents (A0–A8)', icon: <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />, countLabel: '18' },
    { id: 'trigger', label: 'Triggers', icon: <Webhook className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, countLabel: '2' },
    { id: 'http', label: 'FastAPI Backend', icon: <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />, countLabel: '3' },
    { id: 'database', label: 'Postgres DB', icon: <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />, countLabel: '9' },
    { id: 'model', label: 'Language Models', icon: <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />, countLabel: '18' },
    { id: 'tool', label: 'Tools', icon: <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />, countLabel: '9' },
    { id: 'code', label: 'Scripts / Code', icon: <FileCheck className="w-4 h-4 text-slate-600 dark:text-slate-300" />, countLabel: '17' },
    { id: 'humanGate', label: 'Human Review', icon: <UserCheck className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />, countLabel: '1' },
  ]

  const isExpanded = isPinned || open

  return (
    <SidebarProvider open={isExpanded} setOpen={setOpen} animate={true}>
      {/* Desktop Sidebar (Framer Motion Animated Width) */}
      <motion.aside
        className={cn(
          'fixed top-14 bottom-0 left-0 z-40 hidden md:flex flex-col border-r shadow-lg transition-colors select-none',
          'bg-white/95 dark:bg-neutral-900/95 border-slate-200 dark:border-neutral-800 backdrop-blur-xl'
        )}
        animate={{
          width: isExpanded ? '300px' : '64px',
        }}
        transition={{
          duration: 0.25,
          ease: 'easeInOut',
        }}
        onMouseEnter={() => !isPinned && setOpen(true)}
        onMouseLeave={() => !isPinned && setOpen(false)}
      >
        {/* Top Header & Pin Toggle */}
        <div className="p-3 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between min-h-[52px]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
              DP
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="truncate"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-neutral-100 uppercase tracking-wider block truncate">
                  Workflow Index
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 block font-mono">
                  106 Production Nodes
                </span>
              </motion.div>
            )}
          </div>

          {isExpanded && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={cn(
                'p-1.5 rounded-md text-xs transition',
                isPinned
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200'
              )}
              title={isPinned ? 'Unpin Sidebar (Auto-collapse)' : 'Pin Sidebar Open'}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Search Bar */}
        {isExpanded && (
          <div className="p-3 pb-1 border-b border-slate-100 dark:border-neutral-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search nodes, tools, prompts..."
                className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
          {/* Node Category Filters */}
          <div>
            {isExpanded && (
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-2 mb-1">
                Categories
              </h4>
            )}
            <div className="space-y-0.5">
              {categoryFilters.map((cat) => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={cn(
                      'w-full flex items-center rounded-lg transition py-1.5 px-2 text-left',
                      isExpanded ? 'justify-between' : 'justify-center',
                      isActive
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800/60'
                    )}
                    title={!isExpanded ? `${cat.label} (${cat.countLabel})` : undefined}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-white' : ''}>{cat.icon}</span>
                      {isExpanded && <span className="truncate">{cat.label}</span>}
                    </div>
                    {isExpanded && (
                      <span
                        className={cn(
                          'text-[10px] font-mono px-1.5 py-0.2 rounded',
                          isActive
                            ? 'bg-indigo-700/80 text-white'
                            : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                        )}
                      >
                        {cat.countLabel}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* AI Agents A0-A8 Section */}
          <div>
            {isExpanded ? (
              <div className="flex items-center justify-between px-2 mb-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  Specialized Agents (A0–A8)
                </h4>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">9 Agents</span>
              </div>
            ) : (
              <div className="w-full flex justify-center py-1">
                <div className="w-5 h-[1px] bg-slate-200 dark:bg-neutral-800 my-1" />
              </div>
            )}

            <div className="space-y-1">
              {agents.map((ag) => {
                const isSelected = selectedAgentId === ag.id
                return (
                  <button
                    key={ag.id}
                    onClick={() => onFocusAgent(ag.id)}
                    className={cn(
                      'w-full text-left rounded-lg border transition group py-1.5 px-2',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-sm'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/40 text-slate-700 dark:text-neutral-300'
                    )}
                    title={!isExpanded ? `${ag.id}: ${ag.name}` : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {ag.id}
                      </span>
                      {isExpanded && (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                          {ag.stageId.replace('stage-', 'Row ')}
                        </span>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                        {ag.name}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 12 Stages Index */}
          {isExpanded && (
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  Workflow Stages (12)
                </h4>
                {activeStageId && (
                  <button
                    onClick={() => onSelectStage(null)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
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
                      className={cn(
                        'w-full text-left p-1.5 rounded-lg border transition text-xs',
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-white font-medium'
                          : 'border-slate-200/60 dark:border-neutral-800/60 text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-neutral-700'
                      )}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stg.row}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-neutral-600" />
                      </div>
                      <div className="truncate text-slate-800 dark:text-neutral-200 mt-0.5">
                        {stg.title}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Slide-Over Sidebar */}
      <div className="md:hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed inset-0 z-50 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                    DP
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-neutral-100">
                    Workflow Index
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Content */}
              <div className="flex-1 py-4 space-y-5 overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</span>
                  {categoryFilters.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id)
                        setOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-2 rounded-lg text-xs',
                        activeCategory === cat.id
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-slate-700 dark:text-neutral-300'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        <span>{cat.label}</span>
                      </div>
                      <span className="font-mono text-[10px]">{cat.countLabel}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agents A0–A8</span>
                  {agents.map((ag) => (
                    <button
                      key={ag.id}
                      onClick={() => {
                        onFocusAgent(ag.id)
                        setOpen(false)
                      }}
                      className="w-full text-left p-2 rounded-lg border border-slate-200 dark:border-neutral-800 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold">{ag.id}: {ag.name}</span>
                      <span className="text-[10px] text-slate-400">{ag.stageId}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SidebarProvider>
  )
}
