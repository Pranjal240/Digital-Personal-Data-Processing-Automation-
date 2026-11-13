/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useRef, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react'
import { AgentNode } from './nodes/AgentNode'
import { ModelNode } from './nodes/ModelNode'
import { ToolNode } from './nodes/ToolNode'
import { MemoryNode } from './nodes/MemoryNode'
import { GenericNode } from './nodes/GenericNode'
import { StickyGroupNode } from './nodes/StickyGroupNode'
import { CustomWorkflowEdge } from './edges/CustomWorkflowEdge'
import { ControlsBar } from './ControlsBar'
import type { LayoutMode } from '../../utils/layout'

interface WorkflowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
  layoutMode: LayoutMode
  onChangeLayoutMode: (mode: LayoutMode) => void
  onResetLayout: () => void
  totalNodesCount: number
  theme: 'dark' | 'light'
}

const nodeTypes = {
  agent: AgentNode,
  model: ModelNode,
  tool: ToolNode,
  memory: MemoryNode,
  generic: GenericNode,
  stickyGroup: StickyGroupNode,
}

const edgeTypes = {
  custom: CustomWorkflowEdge,
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  layoutMode,
  onChangeLayoutMode,
  onResetLayout,
  totalNodesCount,
  theme,
}) => {
  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow()
  const [showMinimap, setShowMinimap] = useState(true)
  const isInitialFit = useRef(false)

  // Initial fit view on mount
  useEffect(() => {
    if (!isInitialFit.current && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.15, duration: 600 })
        isInitialFit.current = true
      }, 100)
    }
  }, [nodes, fitView])

  // Center on selected node when clicked from sidebar or search
  useEffect(() => {
    if (selectedNodeId) {
      const targetNode = nodes.find((n) => n.id === selectedNodeId)
      if (targetNode) {
        const x = targetNode.position.x + ((targetNode.data?.width as number) || 280) / 2
        const y = targetNode.position.y + ((targetNode.data?.height as number) || 120) / 2
        setCenter(x, y, { zoom: 1.15, duration: 800 })
      }
    }
  }, [selectedNodeId, nodes, setCenter])

  const handleNodeClick: NodeMouseHandler = (_, node) => {
    if (node.type !== 'stickyGroup') {
      onSelectNode(node.id)
    }
  }

  const handlePaneClick = () => {
    onSelectNode(null)
  }

  // MiniMap node color mapper
  const minimapNodeColor = (node: Node) => {
    if (node.type === 'agent') return '#6366f1'
    if (node.type === 'model') return '#f59e0b'
    if (node.type === 'tool') return '#06b6d4'
    if (node.type === 'memory') return '#10b981'
    if (node.type === 'stickyGroup') return theme === 'dark' ? '#1e293b' : '#e2e8f0'
    const cat = (node.data?.raw as any)?._meta?.category
    if (cat === 'database') return '#3b82f6'
    if (cat === 'http') return '#8b5cf6'
    if (cat === 'trigger') return '#14b8a6'
    if (cat === 'notification') return '#f43f5e'
    if (cat === 'condition' || cat === 'router') return '#eab308'
    return '#94a3b8'
  }

  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-[#080c14] overflow-hidden select-none transition-colors">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        minZoom={0.05}
        maxZoom={2.5}
        fitViewOptions={{ padding: 0.15 }}
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color={theme === 'dark' ? '#334155' : '#cbd5e1'}
          className="opacity-70"
        />

        {showMinimap && (
          <MiniMap
            nodeColor={minimapNodeColor}
            nodeStrokeWidth={2}
            nodeBorderRadius={4}
            maskColor={theme === 'dark' ? 'rgba(8, 12, 20, 0.75)' : 'rgba(248, 250, 252, 0.75)'}
            position="bottom-right"
            className="!bottom-6 !right-6 !m-0 !w-56 !h-36 !rounded-xl !shadow-xl"
          />
        )}
      </ReactFlow>

      {/* Floating Canvas Controls */}
      <ControlsBar
        onZoomIn={() => zoomIn({ duration: 300 })}
        onZoomOut={() => zoomOut({ duration: 300 })}
        onFitView={() => fitView({ padding: 0.15, duration: 600 })}
        onResetLayout={onResetLayout}
        layoutMode={layoutMode}
        onChangeLayoutMode={onChangeLayoutMode}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap(!showMinimap)}
        totalNodesCount={totalNodesCount}
      />
    </div>
  )
}
