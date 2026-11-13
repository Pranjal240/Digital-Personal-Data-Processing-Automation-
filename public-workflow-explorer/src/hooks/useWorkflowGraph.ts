import { useState, useMemo, useCallback } from 'react'
import {
  type Node,
  type Edge,
  MarkerType,
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

  // Generate Base Edges
  const baseEdges = useMemo(() => {
    const edges: Edge[] = []
    const connections = workflowData.connections

    Object.entries(connections).forEach(([sourceName, connTypes]) => {
      const sourceId = nameToId.get(sourceName)
      if (!sourceId) return

      Object.entries(connTypes).forEach(([connType, routes]) => {
        routes.forEach((route, routeIndex) => {
          route.forEach((targetObj, targetIndex) => {
            const targetId = nameToId.get(targetObj.node)
            if (!targetId) return

            const edgeId = `e-${sourceId}-${targetId}-${connType}-${routeIndex}-${targetIndex}`
            const isMain = connType === 'main'

            // Source handle mapping
            let sourceHandle = 'main'
            if (connType === 'ai_languageModel') sourceHandle = 'ai_languageModel'
            else if (connType === 'ai_tool') sourceHandle = 'ai_tool'
            else if (connType === 'ai_memory') sourceHandle = 'ai_memory'
            else if (routeIndex === 0 && (sourceName.startsWith('IF:') || sourceName.startsWith('Switch:'))) {
              sourceHandle = 'true'
            } else if (routeIndex === 1 && (sourceName.startsWith('IF:') || sourceName.startsWith('Switch:'))) {
              sourceHandle = 'false'
            }

            edges.push({
              id: edgeId,
              source: sourceId,
              target: targetId,
              sourceHandle,
              targetHandle: isMain ? 'main' : connType,
              type: 'custom',
              animated: isMain,
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
                    color: '#818cf8',
                  }
                : undefined,
            })
          })
        })
      })
    })

    return edges
  }, [nameToId])

  // Build React Flow Nodes
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

      return {
        id: n.id,
        type: nodeType,
        position: { x: n.position[0], y: n.position[1] },
        data: {
          raw: n,
          initialPosition: n.position,
          width: n.parameters?.width || 280,
          height: n.parameters?.height || 120,
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

      const isVisible = (matchesSearch && matchesStage && matchesCategory) || raw._meta.category === 'stickyNote'
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
        hidden: !isVisible && layoutMode !== 'native',
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
    layoutMode,
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
    setLayoutMode,
    idToNode,
    totalNodes: workflowData.nodes.length,
  }
}
