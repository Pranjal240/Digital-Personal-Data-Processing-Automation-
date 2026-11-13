/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'
import { Bookmark, Layers } from 'lucide-react'
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
  const width = params.width || 2280
  const height = params.height || 680
  const content = params.content || ''

  const lines = content.split('\n')
  const title = lines[0]?.replace(/^#+\s*/, '') || raw.name
  const summary = lines.slice(1, 4).join(' ').replace(/[*`_]/g, '').trim()

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="relative rounded-2xl border border-slate-300 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40 p-6 backdrop-blur-[2px] transition-all pointer-events-none select-none shadow-sm dark:shadow-2xl"
    >
      {/* Top stage header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
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

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 font-mono">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Stage Boundary</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-16 bg-gradient-to-b from-indigo-500/[0.015] to-transparent rounded-b-2xl pointer-events-none" />
    </div>
  )
}
