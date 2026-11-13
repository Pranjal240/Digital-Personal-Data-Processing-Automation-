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
    if (node.type === 'agent') return '#818cf8'
    if (node.type === 'model') return '#f59e0b'
    if (node.type === 'tool') return '#06b6d4'
    if (node.type === 'memory') return '#10b981'
    if (node.type === 'stickyGroup') return '#1e293b'
    const cat = (node.data?.raw as any)?._meta?.category
    if (cat === 'database') return '#3b82f6'
    if (cat === 'http') return '#8b5cf6'
    if (cat === 'trigger') return '#10b981'
    if (cat === 'notification') return '#f43f5e'
    if (cat === 'condition' || cat === 'router') return '#eab308'
    return '#475569'
  }

  return (
    <div className="relative w-full h-full bg-[#080c14] overflow-hidden select-none">
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
          color="#1e293b"
          className="opacity-70"
        />

        {showMinimap && (
          <MiniMap
            nodeColor={minimapNodeColor}
            nodeStrokeWidth={2}
            nodeBorderRadius={4}
            maskColor="rgba(8, 12, 20, 0.75)"
            position="bottom-right"
            className="!bottom-6 !right-6 !m-0 !w-56 !h-36 !bg-slate-950/90 !border !border-slate-800 !rounded-xl !shadow-2xl"
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

