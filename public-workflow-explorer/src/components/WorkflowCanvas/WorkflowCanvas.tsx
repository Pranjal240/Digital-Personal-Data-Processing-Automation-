/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type NodeChange,
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
  onNodesChange: (changes: NodeChange[]) => void
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
  layoutMode: LayoutMode
  onChangeLayoutMode: (mode: LayoutMode) => void
  onResetLayout: () => void
  totalNodesCount: number
  theme: 'dark' | 'light'
  activeStageId: string | null
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
  onNodesChange,
  selectedNodeId,
  onSelectNode,
  layoutMode,
  onChangeLayoutMode,
  onResetLayout,
  totalNodesCount,
  theme,
  activeStageId,
}) => {
  const { zoomIn, zoomOut, fitView, fitBounds, setCenter } = useReactFlow()
  // Hide minimap by default so it never blocks the screen
  const [showMinimap, setShowMinimap] = useState(false)

  // Center on selected node when clicked from search or agent list
  useEffect(() => {
    if (selectedNodeId) {
      const targetNode = nodes.find((n) => n.id === selectedNodeId)
      if (targetNode) {
        const w = (targetNode.data as any)?.width || 280
        const h = (targetNode.data as any)?.height || 120
        setCenter(targetNode.position.x + w / 2, targetNode.position.y + h / 2, {
          zoom: 1.05,
          duration: 600,
        })
      }
    }
  }, [selectedNodeId, setCenter])

  // Pan and zoom directly to stage row when clicked in the sidebar
  useEffect(() => {
    if (activeStageId) {
      const stageNodes = nodes.filter(
        (n) => (n.data?.raw as any)?._meta?.stage?.id === activeStageId && n.type !== 'stickyGroup'
      )
      if (stageNodes.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        stageNodes.forEach((n) => {
          const w = (n.data as any)?.width || 280
          const h = (n.data as any)?.height || 120
          minX = Math.min(minX, n.position.x)
          minY = Math.min(minY, n.position.y)
          maxX = Math.max(maxX, n.position.x + w)
          maxY = Math.max(maxY, n.position.y + h)
        })
        fitBounds(
          {
            x: minX - 60,
            y: minY - 60,
            width: (maxX - minX) + 120,
            height: (maxY - minY) + 120,
          },
          { padding: 0.15, duration: 600 }
        )
      }
    }
  }, [activeStageId, fitBounds])

  // When layout mode changes (Dagre Flow vs Stage Rows), re-align camera
  const handleChangeLayoutMode = useCallback((mode: LayoutMode) => {
    onChangeLayoutMode(mode)
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 600 })
    }, 80)
  }, [onChangeLayoutMode, fitView])

  // Reset design layout and re-center view
  const handleResetLayout = useCallback(() => {
    onResetLayout()
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 600 })
    }, 80)
  }, [onResetLayout, fitView])

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
    <div className={`relative w-full h-full select-none transition-colors overflow-hidden ${theme === 'dark' ? 'bg-[#080c14]' : 'bg-[#f8fafc]'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        defaultViewport={{ x: 80, y: 60, zoom: 0.75 }}
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
          color={theme === 'dark' ? '#334155' : '#94a3b8'}
          className="opacity-70"
        />

        {showMinimap && (
          <MiniMap
            nodeColor={minimapNodeColor}
            nodeStrokeWidth={2}
            nodeBorderRadius={4}
            maskColor={theme === 'dark' ? 'rgba(8, 12, 20, 0.75)' : 'rgba(241, 245, 249, 0.75)'}
            position="bottom-right"
            style={{
              backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
            }}
            className="!bottom-16 sm:!bottom-6 !right-3 sm:!right-6 !m-0 !w-36 !h-24 sm:!w-56 sm:!h-36 !rounded-xl !shadow-xl"
          />
        )}
      </ReactFlow>

      {/* Floating Canvas Controls */}
      <ControlsBar
        onZoomIn={() => zoomIn({ duration: 300 })}
        onZoomOut={() => zoomOut({ duration: 300 })}
        onFitView={() => fitView({ padding: 0.15, duration: 600 })}
        onResetLayout={handleResetLayout}
        layoutMode={layoutMode}
        onChangeLayoutMode={handleChangeLayoutMode}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap(!showMinimap)}
        totalNodesCount={totalNodesCount}
      />
    </div>
  )
}
