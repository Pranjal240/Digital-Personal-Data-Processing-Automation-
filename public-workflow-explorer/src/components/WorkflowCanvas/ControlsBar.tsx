import React from 'react'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  LayoutGrid,
  GitPullRequest,
  Map,
  Filter
} from 'lucide-react'
import type { LayoutMode } from '../../utils/layout'

interface ControlsBarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onResetLayout: () => void
  layoutMode: LayoutMode
  onChangeLayoutMode: (mode: LayoutMode) => void
  showMinimap: boolean
  onToggleMinimap: () => void
  activeStageCount?: number
  totalNodesCount: number
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetLayout,
  layoutMode,
  onChangeLayoutMode,
  showMinimap,
  onToggleMinimap,
  totalNodesCount,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl dark:shadow-2xl">
      {/* Zoom controls */}
      <button
        onClick={onZoomIn}
        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={onFitView}
        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
        title="Fit All Nodes in View"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

      {/* Layout Modes */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
        <button
          onClick={() => onChangeLayoutMode('native')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1.5 ${
            layoutMode === 'native'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Preserve original n8n canvas layout with row sections"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Stage Rows</span>
        </button>
        <button
          onClick={() => onChangeLayoutMode('horizontal')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1.5 ${
            layoutMode === 'horizontal'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Hierarchical Left-to-Right DAG layout"
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Dagre Flow</span>
        </button>
      </div>

      <button
        onClick={onResetLayout}
        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition"
        title="Reset Canvas View"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

      {/* Minimap Toggle */}
      <button
        onClick={onToggleMinimap}
        className={`p-2 rounded-lg transition ${
          showMinimap
            ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
        }`}
        title="Toggle Minimap"
      >
        <Map className="w-4 h-4" />
      </button>

      {/* Total nodes pill */}
      <div className="hidden sm:flex items-center gap-1.5 pl-2 pr-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
        <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>{totalNodesCount} Nodes Loaded</span>
      </div>
    </div>
  )
}
