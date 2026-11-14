import React from 'react'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  LayoutGrid,
  ArrowRight,
  ArrowDown,
  Map,
  Lock
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
    <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl dark:shadow-2xl max-w-[calc(100vw-16px)] overflow-x-auto no-scrollbar">
      {/* Zoom controls */}
      <button
        onClick={onZoomIn}
        className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition shrink-0"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition shrink-0"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={onFitView}
        className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition shrink-0"
        title="Fit All Nodes in View"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 sm:h-5 bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

      {/* Structured Layout Modes */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shrink-0">
        <button
          onClick={() => onChangeLayoutMode('native')}
          className={`px-2 sm:px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 sm:gap-1.5 shrink-0 ${
            layoutMode === 'native'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Architectural Row Stages with Background Cards"
        >
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Stage Rows</span>
          <span className="inline sm:hidden">Stages</span>
        </button>
        <button
          onClick={() => onChangeLayoutMode('horizontal')}
          className={`px-2 sm:px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 sm:gap-1.5 shrink-0 ${
            layoutMode === 'horizontal'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Clean Left-to-Right Horizontal Flow"
        >
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Horizontal Flow</span>
          <span className="inline sm:hidden">Horizontal</span>
        </button>
        <button
          onClick={() => onChangeLayoutMode('vertical')}
          className={`px-2 sm:px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 sm:gap-1.5 shrink-0 ${
            layoutMode === 'vertical'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Top-to-Bottom Vertical Pipeline Flow"
        >
          <ArrowDown className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Vertical Flow</span>
          <span className="inline sm:hidden">Vertical</span>
        </button>
      </div>

      <div className="w-[1px] h-4 sm:h-5 bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

      {/* Reset Camera View Button */}
      <button
        onClick={onResetLayout}
        className="px-2 sm:px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 sm:gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shrink-0"
        title="Reset camera zoom and pan back to top-level view"
      >
        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline font-semibold">Reset View</span>
        <span className="inline sm:hidden font-semibold">Reset</span>
      </button>

      <div className="w-[1px] h-4 sm:h-5 bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

      {/* Minimap Toggle */}
      <button
        onClick={onToggleMinimap}
        className={`p-1.5 sm:p-2 rounded-lg transition shrink-0 ${
          showMinimap
            ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
        }`}
        title="Toggle Minimap Overview"
      >
        <Map className="w-4 h-4" />
      </button>

      {/* Fixed Layout Indicator */}
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
        <Lock className="w-3 h-3 text-slate-400" />
        <span>Fixed Diagram ({totalNodesCount} Nodes)</span>
      </div>
    </div>
  )
}
