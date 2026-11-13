/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  type Node,
  type Edge,
  MarkerType,
  Position,
  type NodeChange,
} from '@xyflow/react'
import workflowDataRaw from '../data/workflow.json'
import type {
  SanitizedWorkflow,
  WorkflowNode,
  NodeCategory,
} from '../types/workflow'
import { applyLayout, type LayoutMode } from '../utils/layout'

const workflowData = workflowDataRaw as unknown as SanitizedWorkflow

export function useWorkflowGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set())
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeStageId, setActiveStageId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<NodeCategory | 'all'>('all')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('native')

  // Dynamic user-moved custom node positions for free movability
  const [customPositions, setCustomPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

  // Map of node name to node ID
  const nameToId = useMemo(() => {
    const map = new Map<string, string>()
    workflowData.nodes.forEach((n) => {
      map.set(n.name, n.id)
    })
    return map
  }, [])

  // Map of node ID to raw node
  const idToNode = useMemo(() => {
    const map = new Map<string, WorkflowNode>()
    workflowData.nodes.forEach((n) => {
      map.set(n.id, n)
    })
    return map
  }, [])

  // Map of node ID to node category
  const idToCategory = useMemo(() => {
    const map = new Map<string, NodeCategory>()
    workflowData.nodes.forEach((n) => {
      map.set(n.id, n._meta.category)
    })
    return map
  }, [])

  // Generate Base Edges with 100% matched handles
  const baseEdges = useMemo(() => {
    const edges: Edge[] = []
    const connections = workflowData.connections

    Object.entries(connections).forEach(([sourceName, connTypes]) => {
      const sourceId = nameToId.get(sourceName)
      if (!sourceId) return
      const sourceCat = idToCategory.get(sourceId) || 'other'

      Object.entries(connTypes).forEach(([connType, routes]) => {
        routes.forEach((route, routeIndex) => {
          route.forEach((targetObj, targetIndex) => {
            const targetId = nameToId.get(targetObj.node)
            if (!targetId) return

            const edgeId = `e-${sourceId}-${targetId}-${connType}-${routeIndex}-${targetIndex}`
            const isMain = connType === 'main'

            // Handle resolution
            let sourceHandle = 'main'
            let targetHandle = isMain ? 'main' : connType

            if (connType === 'ai_languageModel') {
              sourceHandle = 'ai_languageModel'
              targetHandle = 'ai_languageModel'
            } else if (connType === 'ai_tool') {
              sourceHandle = 'ai_tool'
              targetHandle = 'ai_tool'
            } else if (connType === 'ai_memory') {
              sourceHandle = 'ai_memory'
              targetHandle = 'ai_memory'
            } else if (sourceCat === 'condition' || sourceName.startsWith('IF:')) {
              sourceHandle = routeIndex === 0 ? 'true' : 'false'
            } else if (sourceCat === 'router' || sourceName.startsWith('Switch:')) {
              sourceHandle = `route-${routeIndex}`
            } else if (sourceCat === 'agent' && routeIndex === 1) {
              // Agent fallback path
              sourceHandle = 'fallback'
            }

            edges.push({
              id: edgeId,
              source: sourceId,
              target: targetId,
              sourceHandle,
              targetHandle,
              type: 'custom',
              animated: isMain && routeIndex === 0,
              data: {
                connectionType: connType as any,
                routeIndex,
                targetIndex,
              },
              markerEnd: isMain
                ? {
                    type: MarkerType.ArrowClosed,
                    width: 14,
                    height: 14,
                    color: routeIndex === 1 ? '#f59e0b' : '#818cf8',
                  }
                : undefined,
            })
          })
        })
      })
    })

    return edges
  }, [nameToId, idToCategory])

  // Build React Flow Nodes with explicit dimensions and pre-defined handles
  const baseNodes = useMemo(() => {
    return workflowData.nodes.map((n) => {
      const category = n._meta.category
      let nodeType = 'generic'

      if (category === 'stickyNote') {
        nodeType = 'stickyGroup'
      } else if (category === 'agent') {
        nodeType = 'agent'
      } else if (category === 'model') {
        nodeType = 'model'
      } else if (category === 'tool') {
        nodeType = 'tool'
      } else if (category === 'memory') {
        nodeType = 'memory'
      }

      const isSticky = category === 'stickyNote'
      const zIndex = isSticky ? -10 : 10

      const width = isSticky
        ? (n.parameters?.width || 2400)
        : category === 'agent'
        ? 300
        : category === 'model'
        ? 240
        : category === 'tool'
        ? 250
        : category === 'memory'
        ? 220
        : 280

      const height = isSticky
        ? (n.parameters?.height || 500)
        : category === 'agent'
        ? 145
        : category === 'model'
        ? 110
        : category === 'tool'
        ? 115
        : category === 'memory'
        ? 95
        : category === 'router'
        ? 140
        : 120

      // Pre-seed handle bounds for instant edge rendering
      let handles: any[] = []
      if (category === 'agent') {
        handles = [
          { id: 'main', type: 'target', position: Position.Left, x: 0, y: 72 },
          { id: 'main', type: 'source', position: Position.Right, x: width, y: 55 },
          { id: 'fallback', type: 'source', position: Position.Right, x: width, y: 100 },
          { id: 'ai_languageModel', type: 'target', position: Position.Bottom, x: width * 0.25, y: height },
          { id: 'ai_memory', type: 'target', position: Position.Bottom, x: width * 0.5, y: height },
          { id: 'ai_tool', type: 'target', position: Position.Bottom, x: width * 0.75, y: height },
        ]
      } else if (category === 'model') {
        handles = [
          { id: 'ai_languageModel', type: 'source', position: Position.Top, x: width * 0.5, y: 0 },
        ]
      } else if (category === 'tool') {
        handles = [
          { id: 'ai_tool', type: 'source', position: Position.Top, x: width * 0.5, y: 0 },
        ]
      } else if (category === 'memory') {
        handles = [
          { id: 'ai_memory', type: 'source', position: Position.Top, x: width * 0.5, y: 0 },
        ]
      } else if (category === 'condition') {
        handles = [
          { id: 'main', type: 'target', position: Position.Left, x: 0, y: height * 0.5 },
          { id: 'true', type: 'source', position: Position.Right, x: width, y: height * 0.35 },
          { id: 'false', type: 'source', position: Position.Right, x: width, y: height * 0.65 },
          { id: 'main', type: 'source', position: Position.Right, x: width, y: height * 0.5 },
        ]
      } else if (category === 'router') {
        handles = [
          { id: 'main', type: 'target', position: Position.Left, x: 0, y: height * 0.5 },
          { id: 'route-0', type: 'source', position: Position.Right, x: width, y: height * 0.2 },
          { id: 'route-1', type: 'source', position: Position.Right, x: width, y: height * 0.4 },
          { id: 'route-2', type: 'source', position: Position.Right, x: width, y: height * 0.6 },
          { id: 'route-3', type: 'source', position: Position.Right, x: width, y: height * 0.8 },
          { id: 'main', type: 'source', position: Position.Right, x: width, y: height * 0.5 },
        ]
      } else if (!isSticky) {
        handles = [
          ...(category !== 'trigger' ? [{ id: 'main', type: 'target', position: Position.Left, x: 0, y: height * 0.5 }] : []),
          ...(category !== 'stop' && category !== 'webhookResponse'
            ? [{ id: 'main', type: 'source', position: Position.Right, x: width, y: height * 0.5 }]
            : []),
        ]
      }

      return {
        id: n.id,
        type: nodeType,
        position: { x: n.position[0], y: n.position[1] },
        initialWidth: width,
        initialHeight: height,
        measured: { width, height },
        handles,
        data: {
          raw: n,
          initialPosition: n.position,
          width,
          height,
        },
        zIndex,
        draggable: true, // Allow full free movability on all nodes!
        selectable: !isSticky,
      } as Node
    })
  }, [])

  // Apply layout algorithm
  const layoutedGraph = useMemo(() => {
    return applyLayout(baseNodes, baseEdges, layoutMode)
  }, [baseNodes, baseEdges, layoutMode])

  // Apply Search, Filter, Highlighting, and Custom Movable Positions
  const processedGraph = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const activeStage = activeStageId
    const activeCat = activeCategory

    const nodes = layoutedGraph.nodes.map((node) => {
      const raw = node.data.raw as WorkflowNode
      if (!raw) return node

      const matchesSearch =
        !q ||
        raw.name.toLowerCase().includes(q) ||
        raw.type.toLowerCase().includes(q) ||
        raw._meta.stage.name.toLowerCase().includes(q) ||
        (raw._meta.agentId && raw._meta.agentId.toLowerCase().includes(q))

      const matchesStage = !activeStage || raw._meta.stage.id === activeStage
      const matchesCategory = activeCat === 'all' || raw._meta.category === activeCat

      const isSelected = selectedNodeId === node.id
      const isHighlighted =
        highlightedNodeIds.has(node.id) ||
        (q.length > 0 && matchesSearch) ||
        (activeStage !== null && matchesStage && raw._meta.category !== 'stickyNote')

      // Position: use user-dragged position if available, else layout position
      const customPos = customPositions.get(node.id)
      const currentPos = customPos ? customPos : node.position

      return {
        ...node,
        position: currentPos,
        initialWidth: (node as any).initialWidth,
        initialHeight: (node as any).initialHeight,
        measured: (node as any).measured,
        handles: (node as any).handles,
        hidden: false,
        data: {
          ...node.data,
          isSelected,
          isHighlighted,
          dimmed: (activeStage !== null && !matchesStage) || (activeCat !== 'all' && !matchesCategory),
        },
      }
    })

    const edges = layoutedGraph.edges.map((edge) => {
      const isHighlighted =
        highlightedEdgeIds.has(edge.id) ||
        (selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId))

      return {
        ...edge,
        data: {
          ...edge.data,
          isHighlighted,
        },
      }
    })

    return { nodes, edges }
  }, [
    layoutedGraph,
    searchQuery,
    activeStageId,
    activeCategory,
    selectedNodeId,
    highlightedNodeIds,
    highlightedEdgeIds,
    customPositions,
  ])

  // Handle free movement changes from React Flow
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setCustomPositions((prev) => {
      const next = new Map(prev)
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.id) {
          next.set(change.id, change.position)
        }
      })
      return next
    })
  }, [])

  // Reset to original non-overlapping design layout
  const resetLayout = useCallback(() => {
    setCustomPositions(new Map())
    setLayoutMode('native')
    setActiveStageId(null)
    setActiveCategory('all')
    setSearchQuery('')
    setSelectedNodeId(null)
    setHighlightedNodeIds(new Set())
    setHighlightedEdgeIds(new Set())
  }, [])

  // Select a node and highlight its neighborhood
  const selectNode = useCallback(
    (nodeId: string | null) => {
      setSelectedNodeId(nodeId)
      if (!nodeId) {
        setHighlightedNodeIds(new Set())
        setHighlightedEdgeIds(new Set())
        return
      }

      // Find neighborhood
      const connectedNodeIds = new Set<string>([nodeId])
      const connectedEdgeIds = new Set<string>()

      baseEdges.forEach((edge) => {
        if (edge.source === nodeId) {
          connectedNodeIds.add(edge.target)
          connectedEdgeIds.add(edge.id)
        } else if (edge.target === nodeId) {
          connectedNodeIds.add(edge.source)
          connectedEdgeIds.add(edge.id)
        }
      })

      setHighlightedNodeIds(connectedNodeIds)
      setHighlightedEdgeIds(connectedEdgeIds)
    },
    [baseEdges]
  )

  // Focus an agent (and its fallback, model, tools, memory)
  const focusAgent = useCallback(
    (agentId: string) => {
      const matchingNode = workflowData.nodes.find(
        (n) => n._meta.category === 'agent' && (n.name.includes(`Agent ${agentId.replace('A', '')}:`) || n.name.includes(agentId))
      )
      if (matchingNode) {
        selectNode(matchingNode.id)
        return matchingNode
      }
      return null
    },
    [selectNode]
  )

  const selectedNode = useMemo(() => {
    return selectedNodeId ? idToNode.get(selectedNodeId) || null : null
  }, [selectedNodeId, idToNode])

  const changeLayoutMode = useCallback((mode: LayoutMode) => {
    setCustomPositions(new Map())
    setLayoutMode(mode)
  }, [])

  return {
    nodes: processedGraph.nodes,
    edges: processedGraph.edges,
    onNodesChange,
    resetLayout,
    selectedNode,
    selectedNodeId,
    selectNode,
    focusAgent,
    searchQuery,
    setSearchQuery,
    activeStageId,
    setActiveStageId,
    activeCategory,
    setActiveCategory,
    layoutMode,
    setLayoutMode: changeLayoutMode,
    idToNode,
    totalNodes: workflowData.nodes.length,
  }
}
