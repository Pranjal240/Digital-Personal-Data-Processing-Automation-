/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'
import { Bookmark, Layers, Cpu } from 'lucide-react'
import type { WorkflowNode } from '../../../types/workflow'

interface StickyGroupNodeProps {
  data: {
    raw: WorkflowNode
    width?: number
    height?: number
  }
}

export const StickyGroupNode: React.FC<StickyGroupNodeProps> = ({ data }) => {
  const { raw } = data
  const params = raw.parameters || {}
  const width = data.width || params.width || 2400
  const height = data.height || params.height || 500
  const content = params.content || ''
  const isMaster = raw.name.includes('Master Overview')

  const lines = content.split('\n')
  const title = lines[0]?.replace(/^#+\s*/, '') || raw.name
  const summary = lines.slice(1, 4).join(' ').replace(/[*`_]/g, '').trim()

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`relative rounded-2xl border transition-all pointer-events-none select-none shadow-sm dark:shadow-2xl ${
        isMaster
          ? 'border-indigo-300 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/70 via-white/80 to-blue-50/70 dark:from-indigo-950/40 dark:via-slate-900/40 dark:to-blue-950/40 p-5'
          : 'border-slate-200/90 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 p-6 backdrop-blur-[2px]'
      }`}
    >
      {/* Top stage header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/60 pb-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
            {isMaster ? <Cpu className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2 flex-wrap">
              <span>{title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700 font-medium">
                {raw.name}
              </span>
            </h3>
            {summary && (
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 font-mono line-clamp-1 max-w-[1200px]">
                {summary}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 font-mono shrink-0 ml-3">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">{isMaster ? 'Production System' : 'Stage Boundary'}</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-16 bg-gradient-to-b from-indigo-500/[0.015] to-transparent rounded-b-2xl pointer-events-none" />
    </div>
  )
}
